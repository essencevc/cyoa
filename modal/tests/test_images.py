import pytest
from unittest.mock import MagicMock, patch, mock_open
import json
import uuid
from pathlib import Path


# Mock the modal library since it's not available in the test environment
class MockModal:
    class Image:
        @staticmethod
        def debian_slim(python_version=None):
            return MockImage()
            
    class App:
        def __init__(self, name=None, image=None):
            self.name = name
            self.image = image
            
        def cls(self, **kwargs):
            def decorator(cls):
                return cls
            return decorator
            
        def web_endpoint(self, method=None):
            def decorator(func):
                return func
            return decorator
            
    class Volume:
        @staticmethod
        def from_name(name, create_if_missing=False):
            return MockVolume()
            
    class Mount:
        @staticmethod
        def from_local_file(source, dest):
            return MockMount(source, dest)
            
    class Secret:
        @staticmethod
        def from_name(name):
            return MockSecret(name)
            
    @staticmethod
    def enter():
        def decorator(func):
            return func
        return decorator
        
    @staticmethod
    def method():
        def decorator(func):
            return func
        return decorator


class MockImage:
    def apt_install(self, *args):
        return self
        
    def pip_install(self, *args):
        return self
        
    def run_commands(self, *args):
        return self


class MockVolume:
    pass


class MockMount:
    def __init__(self, source, dest):
        self.source = source
        self.dest = dest


class MockSecret:
    def __init__(self, name):
        self.name = name


# Patch modal before importing the module
with patch.dict('sys.modules', {'modal': MagicMock()}):
    import sys
    sys.modules['modal'] = MockModal()
    
    # Now we can import our module
    from images import ComfyUI


@pytest.fixture
def comfy_ui():
    return ComfyUI()


@pytest.fixture
def mock_subprocess():
    with patch('subprocess.run') as mock_run:
        yield mock_run


@pytest.fixture
def mock_path():
    with patch('pathlib.Path') as mock_path:
        mock_file = MagicMock()
        mock_file.read_text.return_value = json.dumps({
            "6": {"inputs": {"text": "original prompt"}},
            "9": {"inputs": {"filename_prefix": "original_prefix"}}
        })
        mock_file.read_bytes.return_value = b"test_image_data"
        mock_file.name = "test_file.png"
        
        mock_path.return_value = mock_file
        
        # Mock the iterdir method to return a list with one file
        mock_dir = MagicMock()
        mock_dir.iterdir.return_value = [mock_file]
        mock_path.side_effect = lambda p: mock_file if p.endswith(".json") else mock_dir
        
        yield mock_path


@pytest.fixture
def mock_boto3():
    with patch('boto3.client') as mock_client:
        mock_s3 = MagicMock()
        mock_client.return_value = mock_s3
        yield mock_s3


def test_launch_comfy_background(comfy_ui, mock_subprocess):
    """Test that the ComfyUI background process is launched correctly"""
    comfy_ui.launch_comfy_background()
    
    mock_subprocess.assert_called_once_with(
        "comfy launch --background", 
        shell=True, 
        check=True
    )


def test_infer(comfy_ui, mock_subprocess, mock_path):
    """Test the inference method"""
    result = comfy_ui.infer()
    
    # Check that the comfy run command was executed
    mock_subprocess.assert_called_once_with(
        "comfy run --workflow /root/flux.json --wait --timeout 1200", 
        shell=True, 
        check=True
    )
    
    # Check that the file was read
    mock_path.assert_any_call("/root/flux.json")
    
    # Check that the output directory was checked
    mock_path.assert_any_call("/root/comfy/ComfyUI/output")
    
    # Check that the result is the file content
    assert result == b"test_image_data"


def test_api(comfy_ui, mock_path, mock_boto3):
    """Test the API endpoint"""
    # Mock uuid.uuid4
    with patch('uuid.uuid4') as mock_uuid:
        mock_uuid.return_value.hex = "test_uuid"
        
        # Mock open
        with patch('builtins.open', mock_open()) as mock_file:
            # Mock os.getenv
            with patch('os.getenv') as mock_getenv:
                mock_getenv.return_value = "test-bucket"
                
                # Mock the infer method
                comfy_ui.infer = MagicMock(return_value=b"test_image_data")
                
                # Call the API
                comfy_ui.api({
                    "prompt": "test prompt",
                    "story_id": "test_story_id",
                    "node_id": "test_node_id"
                })
                
                # Check that the workflow was loaded
                mock_path.assert_any_call("/root/flux.json")
                
                # Check that the prompt was updated in the workflow
                assert mock_path().read_text.called
                
                # Check that the new workflow was saved
                assert mock_file.called
                
                # Check that infer was called with the new workflow
                comfy_ui.infer.assert_called_once_with("test_uuid.json")
                
                # Check that the result was uploaded to S3
                mock_boto3.put_object.assert_called_once_with(
                    Bucket="test-bucket",
                    Key="test_story_id/test_node_id.png",
                    Body=b"test_image_data"
                )