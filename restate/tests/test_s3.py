import pytest
from unittest.mock import MagicMock, patch
from helpers.s3 import get_story_items


@pytest.fixture
def mock_boto3():
    with patch("helpers.s3.boto3") as mock_boto3:
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client
        yield mock_client


@pytest.fixture
def mock_env():
    with patch("helpers.s3.Env") as mock_env:
        mock_env_instance = MagicMock()
        mock_env_instance.AWS_ACCESS_KEY_ID = "test_access_key"
        mock_env_instance.AWS_SECRET_ACCESS_KEY = "test_secret_key"
        mock_env_instance.AWS_REGION = "test_region"
        mock_env.return_value = mock_env_instance
        yield mock_env


def test_get_story_items_with_contents(mock_boto3, mock_env):
    """Test getting story items when S3 returns contents"""
    # Mock S3 response
    mock_boto3.list_objects_v2.return_value = {
        "Contents": [
            {"Key": "test_story_id/node1.png"},
            {"Key": "test_story_id/node2.png"},
            {"Key": "test_story_id/banner.png"},
            {"Key": "test_story_id/theme.wav"},
            {"Key": "test_story_id/node1.wav"},
        ]
    }
    
    # Call the function
    result = get_story_items("test_story_id")
    
    # Verify the result
    assert "images" in result
    assert "audio" in result
    assert set(result["images"]) == {"node1", "node2", "banner"}
    assert set(result["audio"]) == {"theme", "node1"}
    
    # Verify S3 client was created with correct parameters
    mock_boto3.list_objects_v2.assert_called_once_with(
        Bucket="restate-story", Prefix="test_story_id/"
    )


def test_get_story_items_no_contents(mock_boto3, mock_env):
    """Test getting story items when S3 returns no contents"""
    # Mock S3 response with no Contents
    mock_boto3.list_objects_v2.return_value = {}
    
    # Call the function
    result = get_story_items("test_story_id")
    
    # Verify the result
    assert "images" in result
    assert "audio" in result
    assert result["images"] == []
    assert result["audio"] == []


def test_get_story_items_client_error(mock_boto3, mock_env):
    """Test getting story items when S3 client raises an error"""
    # Mock S3 client to raise an error
    from botocore.exceptions import ClientError
    mock_boto3.list_objects_v2.side_effect = ClientError(
        {"Error": {"Code": "NoSuchBucket", "Message": "The bucket does not exist"}},
        "ListObjectsV2"
    )
    
    # Call the function
    result = get_story_items("test_story_id")
    
    # Verify the result is a dictionary with empty lists for 'images' and 'audio'
    assert "images" in result
    assert "audio" in result
    assert result["images"] == []
    assert result["audio"] == []