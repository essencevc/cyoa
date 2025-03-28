import pytest
from unittest.mock import MagicMock, patch, AsyncMock
import asyncio
from helpers.story import (
    StoryOutline,
    StoryNode,
    FinalStoryNode,
    StoryNodes,
    generate_story,
    generate_story_choices,
    generate_images,
    generate_tts,
)


@pytest.fixture
def mock_genai():
    with patch("helpers.story.genai") as mock_genai:
        yield mock_genai


@pytest.fixture
def mock_instructor():
    with patch("helpers.story.instructor") as mock_instructor:
        mock_client = MagicMock()
        mock_instructor.from_gemini.return_value = mock_client
        yield mock_client


@pytest.fixture
def mock_async_instructor():
    with patch("helpers.story.instructor") as mock_instructor:
        mock_client = AsyncMock()
        mock_instructor.from_gemini.return_value = mock_client
        yield mock_client


def test_generate_story(mock_genai, mock_instructor):
    """Test generating a story outline"""
    # Mock the response from the LLM
    mock_response = StoryOutline(
        title="Test Story",
        description="This is a test story",
        melody="Test melody",
        banner_image="Test banner image"
    )
    mock_instructor.chat.completions.create.return_value = mock_response
    
    # Call the function
    result = generate_story("Test prompt")
    
    # Verify the result
    assert result == mock_response
    
    # Verify the LLM was called with the correct parameters
    mock_instructor.chat.completions.create.assert_called_once()
    args, kwargs = mock_instructor.chat.completions.create.call_args
    
    # Check that the response model is correct
    assert kwargs["response_model"] == StoryOutline
    
    # Check that the messages contain the prompt
    assert any("Test prompt" in msg["content"] for msg in kwargs["messages"])


@pytest.mark.asyncio
async def test_generate_story_choices(mock_genai, mock_async_instructor):
    """Test generating story choices"""
    # Create a mock story outline
    story = StoryOutline(
        title="Test Story",
        description="This is a test story",
        melody="Test melody",
        banner_image="Test banner image"
    )
    
    # Mock the response from the LLM
    mock_node = StoryNode(
        title="Test Node",
        story_description="This is a test node",
        banner_image_description="Test banner image",
        user_choices=[
            {"choice_title": "Choice 1", "choice_description": "Description 1"},
            {"choice_title": "Choice 2", "choice_description": "Description 2"}
        ]
    )
    
    # Set up the mock to return different responses for different calls
    mock_async_instructor.chat.completions.create = AsyncMock()
    mock_async_instructor.chat.completions.create.side_effect = [
        mock_node,  # First level
        mock_node,  # Second level - choice 1
        mock_node,  # Second level - choice 2
        StoryNode(  # Third level - terminal node 1
            title="Terminal Node 1",
            story_description="This is terminal node 1",
            banner_image_description="Terminal image 1",
            user_choices=[]
        ),
        StoryNode(  # Third level - terminal node 2
            title="Terminal Node 2",
            story_description="This is terminal node 2",
            banner_image_description="Terminal image 2",
            user_choices=[]
        ),
        StoryNode(  # Third level - terminal node 3
            title="Terminal Node 3",
            story_description="This is terminal node 3",
            banner_image_description="Terminal image 3",
            user_choices=[]
        ),
        StoryNode(  # Third level - terminal node 4
            title="Terminal Node 4",
            story_description="This is terminal node 4",
            banner_image_description="Terminal image 4",
            user_choices=[]
        )
    ]
    
    # Call the function
    result = await generate_story_choices(story)
    
    # Verify the result
    assert isinstance(result, StoryNodes)
    assert len(result.nodes) == 7  # 1 root + 2 second level + 4 terminal nodes
    
    # Check that we have the expected number of terminal nodes
    terminal_nodes = [node for node in result.nodes if node.is_terminal]
    assert len(terminal_nodes) == 4
    
    # Check that we have the expected number of non-terminal nodes
    non_terminal_nodes = [node for node in result.nodes if not node.is_terminal]
    assert len(non_terminal_nodes) == 3


@pytest.mark.asyncio
async def test_generate_images(monkeypatch):
    """Test generating images for story nodes"""
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
    
    # Mock the aiohttp ClientSession
    mock_session = AsyncMock()
    mock_response = AsyncMock()
    mock_response.text = AsyncMock(return_value="Success")
    mock_session.__aenter__.return_value = mock_session
    mock_session.post.return_value.__aenter__.return_value = mock_response
    
    # Mock the Env class
    mock_env = MagicMock()
    mock_env.IMAGE_ENDPOINT = "http://test-image-endpoint"
    
    # Patch the required modules
    with patch("helpers.story.aiohttp.ClientSession", return_value=mock_session), \
         patch("helpers.story.Env", return_value=mock_env):
        
        # Call the function
        result = await generate_images(nodes, "test_story_id", "Banner image description")
        
        # Verify the result
        assert result == "Success"
        
        # Verify that post was called for each node plus the banner
        assert mock_session.post.call_count == 3
        
        # Check the calls
        calls = mock_session.post.call_args_list
        
        # First two calls should be for the nodes
        assert calls[0][0][0] == "http://test-image-endpoint"
        assert "node1" in str(calls[0][1]["json"])
        
        assert calls[1][0][0] == "http://test-image-endpoint"
        assert "node2" in str(calls[1][1]["json"])
        
        # Last call should be for the banner
        assert calls[2][0][0] == "http://test-image-endpoint"
        assert "banner" in str(calls[2][1]["json"])


@pytest.mark.asyncio
async def test_generate_tts(monkeypatch):
    """Test generating text-to-speech for story nodes"""
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
    
    # Mock the aiohttp ClientSession
    mock_session = AsyncMock()
    mock_response = AsyncMock()
    mock_response.text = AsyncMock(return_value="Success")
    mock_session.__aenter__.return_value = mock_session
    mock_session.post.return_value.__aenter__.return_value = mock_response
    
    # Mock the Env class
    mock_env = MagicMock()
    mock_env.KOKORO_ENDPOINT = "http://test-tts-endpoint"
    
    # Patch the required modules
    with patch("helpers.story.aiohttp.ClientSession", return_value=mock_session), \
         patch("helpers.story.Env", return_value=mock_env):
        
        # Call the function
        result = await generate_tts(nodes, "test_story_id", "Story description")
        
        # Verify the result
        assert result == "Success"
        
        # Verify that post was called for each node plus the theme
        assert mock_session.post.call_count == 3
        
        # Check the calls
        calls = mock_session.post.call_args_list
        
        # First two calls should be for the nodes
        assert calls[0][0][0] == "http://test-tts-endpoint"
        assert "node1" in str(calls[0][1]["json"])
        
        assert calls[1][0][0] == "http://test-tts-endpoint"
        assert "node2" in str(calls[1][1]["json"])
        
        # Last call should be for the theme
        assert calls[2][0][0] == "http://test-tts-endpoint"
        assert "theme" in str(calls[2][1]["json"])