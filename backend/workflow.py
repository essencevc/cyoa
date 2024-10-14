from __future__ import annotations
from restate.workflow import Workflow
from restate.context import WorkflowContext, WorkflowSharedContext
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import os

story_workflow = Workflow("StoryWorkflow")

# Add this line to securely get the API key
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")

class StoryInput(BaseModel):
    user_name: str
    title: str
    content: str
    main_character: str

class StoryNode(BaseModel):
    choice_text: Optional[str]
    content: str
    image_id: Optional[str]
    music_id: Optional[str]
    choices: List[StoryNode]

@story_workflow.handler()
async def generate_main_story(ctx: WorkflowSharedContext):
    json_data = await ctx.get("story_input")
    story_input = StoryInput.model_validate_json(json_data=json_data, strict=True)
    
    # Create Anthropic client
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    
    # Prepare the prompt for Claude
    prompt = f"""
    Generate an interactive story based on the following input:
    Title: {story_input.title}
    Main Character: {story_input.main_character}
    Initial Content: {story_input.content}

    Create a story with multiple choice options. The story should be structured as follows:
    1. An opening scene
    2. Two or three choices for the reader
    3. For each choice, a continuation of the story
    4. Each continuation should end with two more choices

    Present the story as a nested structure, where each node contains:
    - content: The story text for that node
    - choices: A list of options, each leading to another story node
    - choice_text: The text describing the choice (only for nodes that are choices)

    Do not include image_id or music_id in the response.
    """

    # Call Claude API
    message = client.messages.create(
        model="claude-3-haiku-20240307",
        prompt=prompt,
        max_tokens=2048,
    )

    # Parse the response and create a StoryNode structure
    # Note: This is a simplified parsing. You may need to implement more robust parsing logic.
    story_content = message.
    root_node = StoryNode(content=story_content, choices=[])

    # Store the generated story in the context
    await ctx.set("generated_story", root_node.model_dump_json())

# Update the main function to return the generated story
@story_workflow.main()
async def generate_story(ctx: WorkflowContext, story: StoryInput) -> StoryNode:
    await ctx.set("story_input", story.model_dump_json())
    await ctx.run(
        "generate_main_story",
        lambda: generate_main_story(ctx)
    )

    # Retrieve and return the generated story
    generated_story_json = await ctx.get("generated_story")
    return StoryNode.model_validate_json(generated_story_json)
