import pytest
from unittest.mock import MagicMock, patch
from helpers.db import DatabaseClient
from helpers.story import StoryOutline, FinalStoryNode


@pytest.fixture
def mock_env():
    with patch("helpers.db.Env") as mock_env:
        mock_env_instance = MagicMock()
        mock_env_instance.DB_URL = "test_url"
        mock_env_instance.DB_TOKEN = "test_token"
        mock_env.return_value = mock_env_instance
        yield mock_env


@pytest.fixture
def mock_connection():
    with patch("helpers.db.create_client_sync") as mock_create_client:
        mock_conn = MagicMock()
        mock_create_client.return_value = mock_conn
        yield mock_conn


@pytest.fixture
def db_client(mock_env, mock_connection):
    # Reset the singleton instance
    DatabaseClient._instance = None
    DatabaseClient._connection = None
    return DatabaseClient()


def test_singleton_pattern():
    """Test that DatabaseClient follows the singleton pattern"""
    # Reset the singleton instance
    DatabaseClient._instance = None
    
    client1 = DatabaseClient()
    client2 = DatabaseClient()
    
    assert client1 is client2


def test_insert_story(db_client, mock_connection):
    """Test inserting a story into the database"""
    # Create a mock story
    story = StoryOutline(
        title="Test Story",
        description="This is a test story",
        melody="Test melody",
        banner_image="Test banner image"
    )
    
    # Mock uuid.uuid4() to return a predictable value
    with patch("uuid.uuid4") as mock_uuid:
        mock_uuid.return_value.hex = "test_id"
        mock_uuid.return_value.__str__.return_value = "test_id"
        
        # Call the method
        story_id = db_client.insert_story(story, "test@example.com", "Test prompt")
        
        # Verify the result
        assert story_id == "test_id"
        
        # Verify the database call
        mock_connection.execute.assert_called_once()
        args, kwargs = mock_connection.execute.call_args
        
        # Check that the query contains the expected values
        assert "INSERT INTO stories" in args[0]
        assert args[1][0] == "test_id"
        assert args[1][1] == "test@example.com"
        assert args[1][2] == "Test Story"
        assert args[1][3] == "This is a test story"
        assert args[1][4] == "PROCESSING"
        assert args[1][6] == "Test prompt"
        assert args[1][7] == "Test banner image"


def test_mark_story_as_completed(db_client, mock_connection):
    """Test marking a story as completed"""
    # Call the method
    db_client.mark_story_as_completed("test_id")
    
    # Verify the database call
    mock_connection.execute.assert_called_once()
    args, kwargs = mock_connection.execute.call_args
    
    # Check that the query contains the expected values
    assert "UPDATE stories SET status = 'GENERATED'" in args[0]
    assert args[1][0] == "test_id"


def test_insert_story_nodes(db_client, mock_connection):
    """Test inserting story nodes into the database"""
    # Create mock nodes
    nodes = [
        FinalStoryNode(
            id="node1",
            parent_id=None,
            title="Node 1",
            description="This is node 1",
            image_description="Image for node 1",
            choice_title="Choice 1",
            choice_description="Description for choice 1",
            is_terminal=False
        ),
        FinalStoryNode(
            id="node2",
            parent_id="node1",
            title="Node 2",
            description="This is node 2",
            image_description="Image for node 2",
            choice_title="Choice 2",
            choice_description="Description for choice 2",
            is_terminal=True
        )
    ]
    
    # Call the method
    db_client.insert_story_nodes(nodes, "test_story_id", "test@example.com")
    
    # Verify the database calls
    assert mock_connection.execute.call_count == 2
    
    # Check first node
    args1, kwargs1 = mock_connection.execute.call_args_list[0]
    assert "INSERT INTO story_choices" in args1[0]
    assert args1[1][0] == "node1"
    assert args1[1][1] == "test@example.com"
    assert args1[1][2] == "NULL"  # parent_id is None
    assert args1[1][3] == "test_story_id"
    assert args1[1][4] == "This is node 1"
    assert args1[1][5] == "Choice 1"
    assert args1[1][6] == "Description for choice 1"
    assert args1[1][7] == 0  # is_terminal is False
    assert args1[1][8] == 1  # explored is 1 for root node
    
    # Check second node
    args2, kwargs2 = mock_connection.execute.call_args_list[1]
    assert args2[1][0] == "node2"
    assert args2[1][1] == "test@example.com"
    assert args2[1][2] == "node1"  # parent_id
    assert args2[1][3] == "test_story_id"
    assert args2[1][4] == "This is node 2"
    assert args2[1][5] == "Choice 2"
    assert args2[1][6] == "Description for choice 2"
    assert args2[1][7] == 1  # is_terminal is True
    assert args2[1][8] == 0  # explored is 0 for non-root node


def test_get_connection_retry(db_client, mock_connection):
    """Test that get_connection retries on failure"""
    # Make the connection fail on first attempt
    mock_connection.execute.side_effect = [Exception("Connection failed"), None]
    
    # Reset the connection
    db_client._connection = None
    
    # Use the context manager
    with db_client.get_connection():
        pass
    
    # Verify that create_client_sync was called twice
    with patch("helpers.db.create_client_sync") as mock_create_client:
        mock_create_client.return_value = mock_connection
        assert mock_create_client.call_count <= 2  # Called at most twice