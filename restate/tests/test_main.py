import pytest
from unittest.mock import MagicMock, patch, AsyncMock
import asyncio
from restate.exceptions import TerminalError
from helpers.story import StoryOutline, StoryNodes, FinalStoryNode
from main import run, StoryInput, wrap_async_call


@pytest.fixture
def mock_ctx():
    ctx = AsyncMock()
    ctx.run = AsyncMock()
    return ctx


@pytest.fixture
def mock_db():
    with patch("main.DatabaseClient") as mock_db_class:
        mock_db_instance = MagicMock()
        mock_db_class.return_value = mock_db_instance
        yield mock_db_instance


@pytest.fixture
def mock_story_generator():
    with patch("main.generate_story") as mock_gen:
        mock_gen.return_value = StoryOutline(
            title="Test Story",
            description="This is a test story",
            melody="Test melody",
            banner_image="Test banner image"
        )
        yield mock_gen


@pytest.fixture
def mock_choices_generator():
    with patch("main.generate_story_choices") as mock_gen:
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
        mock_gen.return_value = StoryNodes(nodes=nodes)
        yield mock_gen


@pytest.fixture
def mock_image_generator():
    with patch("main.generate_images") as mock_gen:
        mock_gen.return_value = "Success"
        yield mock_gen


@pytest.fixture
def mock_tts_generator():
    with patch("main.generate_tts") as mock_gen:
        mock_gen.return_value = "Success"
        yield mock_gen


@pytest.fixture
def mock_s3():
    with patch("main.get_story_items") as mock_s3:
        # First call returns empty, second call returns all items
        mock_s3.side_effect = [
            {"images": [], "audio": []},
            {"images": ["node1", "node2", "banner"], "audio": ["node1", "node2", "theme"]}
        ]
        yield mock_s3


@pytest.mark.asyncio
async def test_wrap_async_call():
    """Test the wrap_async_call helper function"""
    # Create a mock async function
    mock_async_fn = AsyncMock()
    mock_async_fn.return_value = "test_result"
    
    # Wrap it
    wrapped_fn = wrap_async_call(mock_async_fn, "arg1", "arg2", kwarg1="value1")
    
    # Call the wrapped function
    result = await wrapped_fn()
    
    # Verify the result
    assert result == "test_result"
    
    # Verify the mock was called with the correct arguments
    mock_async_fn.assert_called_once_with("arg1", "arg2", kwarg1="value1")


@pytest.mark.asyncio
async def test_run_workflow_success(
    mock_ctx, mock_db, mock_story_generator, mock_choices_generator,
    mock_image_generator, mock_tts_generator, mock_s3
):
    """Test the main workflow run function with successful execution"""
    # Set up the mock context to return expected values
    mock_ctx.run.side_effect = [
        StoryOutline(
            title="Test Story",
            description="This is a test story",
            melody="Test melody",
            banner_image="Test banner image"
        ),
        "test_story_id",
        StoryNodes(nodes=[
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
        ]),
        None,  # insert_story_nodes
        None,  # generate_images
        None,  # generate_tts
        {"images": [], "audio": []},  # First S3 check
        {"images": ["node1", "node2", "banner"], "audio": ["node1", "node2", "theme"]},  # Second S3 check
        None,  # mark_story_as_completed
    ]
    
    # Create a story input
    story_input = StoryInput(
        prompt="Test prompt",
        user_email="test@example.com"
    )
    
    # Call the function
    result = await run(mock_ctx, story_input)
    
    # Verify the result
    assert result == "success"
    
    # Verify that all the expected functions were called
    assert mock_ctx.run.call_count == 9
    
    # Verify that the database functions were called
    mock_db.insert_story.assert_called_once()
    mock_db.insert_story_nodes.assert_called_once()
    mock_db.mark_story_as_completed.assert_called_once()


@pytest.mark.asyncio
async def test_run_workflow_story_generation_failure(mock_ctx, mock_db, mock_story_generator):
    """Test the main workflow when story generation fails"""
    # Set up the mock context to raise an error
    mock_ctx.run.side_effect = TerminalError("Failed to generate story")
    
    # Create a story input
    story_input = StoryInput(
        prompt="Test prompt",
        user_email="test@example.com"
    )
    
    # Call the function and expect it to raise an error
    with pytest.raises(TerminalError) as excinfo:
        await run(mock_ctx, story_input)
    
    # Verify the error message
    assert "Failed to generate story" in str(excinfo.value)
    
    # Verify that only the first function was called
    assert mock_ctx.run.call_count == 1
    
    # Verify that no database functions were called
    mock_db.insert_story.assert_not_called()
    mock_db.insert_story_nodes.assert_not_called()
    mock_db.mark_story_as_completed.assert_not_called()


@pytest.mark.asyncio
async def test_run_workflow_db_insert_failure(mock_ctx, mock_db, mock_story_generator):
    """Test the main workflow when database insertion fails"""
    # Set up the mock context to return a story but fail on DB insert
    mock_ctx.run.side_effect = [
        StoryOutline(
            title="Test Story",
            description="This is a test story",
            melody="Test melody",
            banner_image="Test banner image"
        ),
        Exception("Database error")
    ]
    
    # Create a story input
    story_input = StoryInput(
        prompt="Test prompt",
        user_email="test@example.com"
    )
    
    # Call the function and expect it to raise an error
    with pytest.raises(TerminalError) as excinfo:
        await run(mock_ctx, story_input)
    
    # Verify the error message
    assert "Failed to insert story" in str(excinfo.value)
    
    # Verify that only the first two functions were called
    assert mock_ctx.run.call_count == 2
    
    # Verify that only the first database function was attempted
    mock_db.insert_story_nodes.assert_not_called()
    mock_db.mark_story_as_completed.assert_not_called()


@pytest.mark.asyncio
async def test_run_workflow_timeout(
    mock_ctx, mock_db, mock_story_generator, mock_choices_generator,
    mock_image_generator, mock_tts_generator, mock_s3
):
    """Test the main workflow when S3 polling times out"""
    # Set up the mock context to return expected values but with S3 always empty
    mock_s3.side_effect = [{"images": [], "audio": []}] * 11  # Always return empty
    
    mock_ctx.run.side_effect = [
        StoryOutline(
            title="Test Story",
            description="This is a test story",
            melody="Test melody",
            banner_image="Test banner image"
        ),
        "test_story_id",
        StoryNodes(nodes=[
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
        ]),
        None,  # insert_story_nodes
        None,  # generate_images
        None,  # generate_tts
    ] + [{"images": [], "audio": []}] * 11  # S3 checks always return empty
    
    # Create a story input
    story_input = StoryInput(
        prompt="Test prompt",
        user_email="test@example.com"
    )
    
    # Call the function
    result = await run(mock_ctx, story_input)
    
    # Verify the result
    assert result == "success"
    
    # Verify that the sleep function was called multiple times
    assert mock_ctx.sleep.call_count > 0
    
    # Verify that the database functions were called
    mock_db.insert_story.assert_called_once()
    mock_db.insert_story_nodes.assert_called_once()
    mock_db.mark_story_as_completed.assert_called_once()