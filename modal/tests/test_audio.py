import pytest
from unittest.mock import MagicMock, patch, mock_open
import tempfile


# Mock the modal library since it's not available in the test environment
class MockModal:
    class Image:
        @staticmethod
        def debian_slim():
            return MockImage()
            
    class App:
        def __init__(self, name=None):
            self.name = name
            
        def function(self, image=None, gpu=None, secrets=None):
            def decorator(func):
                return func
            return decorator
            
        def web_endpoint(self, method=None):
            def decorator(func):
                return func
            return decorator
            
    class Secret:
        @staticmethod
        def from_name(name):
            return MockSecret(name)


class MockImage:
    def apt_install(self, *args):
        return self
        
    def pip_install(self, *args):
        return self
        
    def run_function(self, func):
        return self


class MockSecret:
    def __init__(self, name):
        self.name = name


# Patch modal before importing the module
with patch.dict('sys.modules', {'modal': MagicMock()}):
    import sys
    sys.modules['modal'] = MockModal()
    
    # Now we can import our module
    from audio import generate_audio, AudioRequest


@pytest.fixture
def mock_transformers():
    with patch('transformers.pipeline') as mock_pipeline:
        mock_pipe = MagicMock()
        mock_pipe.return_value = {"audio": [0.1, 0.2, 0.3], "sampling_rate": 44100}
        mock_pipeline.return_value = mock_pipe
        yield mock_pipeline


@pytest.fixture
def mock_wavfile():
    with patch('scipy.io.wavfile') as mock_wavfile:
        yield mock_wavfile


@pytest.fixture
def mock_tempfile():
    with patch('tempfile.NamedTemporaryFile') as mock_temp:
        mock_temp_file = MagicMock()
        mock_temp_file.name = "/tmp/test_audio.wav"
        mock_temp.return_value.__enter__.return_value = mock_temp_file
        yield mock_temp


@pytest.fixture
def mock_boto3():
    with patch('boto3.client') as mock_client:
        mock_s3 = MagicMock()
        mock_client.return_value = mock_s3
        yield mock_s3


@pytest.fixture
def mock_requests():
    with patch('requests.post') as mock_post:
        yield mock_post


def test_generate_audio(mock_transformers, mock_wavfile, mock_tempfile, mock_boto3, mock_requests):
    """Test the audio generation endpoint"""
    # Mock open
    with patch('builtins.open', mock_open(read_data=b"test_audio_data")) as mock_file:
        # Mock os.getenv
        with patch('os.getenv') as mock_getenv:
            mock_getenv.return_value = "test-bucket"
            
            # Create a request
            request = AudioRequest(
                prompt="Generate epic adventure music",
                storyId="test_story_id",
                callback_url="http://test-callback",
                callback_token="test-token"
            )
            
            # Call the function
            generate_audio(request)
            
            # Check that the pipeline was created correctly
            mock_transformers.assert_called_once_with("text-to-audio", model="facebook/musicgen-medium")
            
            # Check that the pipeline was called with the prompt
            mock_transformers.return_value.assert_called_once_with(
                "Generate epic adventure music",
                forward_params={"do_sample": True}
            )
            
            # Check that the audio was written to a file
            mock_wavfile.write.assert_called_once_with(
                "/tmp/test_audio.wav", 
                44100, 
                [0.1, 0.2, 0.3]
            )
            
            # Check that the file was opened
            mock_file.assert_called_once_with("/tmp/test_audio.wav", "rb")
            
            # Check that the audio was uploaded to S3
            mock_boto3.put_object.assert_called_once_with(
                Bucket="test-bucket",
                Key="test_story_id/theme_song.wav",
                Body=b"test_audio_data"
            )
            
            # Check that the callback was called
            mock_requests.assert_called_once_with(
                "http://test-callback",
                headers={"Authorization": "Bearer test-token"}
            )