from __future__ import annotations
from restate.workflow import Workflow
from restate.context import WorkflowSharedContext
from pydantic import BaseModel, field_validator
import anthropic
from cyoa.settings import env
import instructor

story_workflow = Workflow("StoryWorkflow")


class StoryInput(BaseModel):
    title: str
    content: str
    main_character: str


class Choice(BaseModel):
    choice_text: str
    is_terminal: bool


class StoryNode(BaseModel):
    setting: str
    choices: list[Choice]

    @field_validator("choices")
    def validate_choices(cls, v):
        if len(v) < 3:
            raise ValueError("At least three choices are required")
        return v


@story_workflow.handler()
async def generate_story(ctx: WorkflowSharedContext, story_input: dict):
    story_input = StoryInput.model_validate(story_input)
    client = instructor.from_anthropic(
        anthropic.Anthropic(api_key=env.ANTHROPIC_API_KEY)
    )
    story = client.chat.completions.create(
        model="claude-3-5-sonnet-20240620",
        response_model=StoryNode,
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": """
                    Generate an interactive story based on the following input:
                    Title: {{ title }}
                    Main Character: {{ main_character }}
                    Initial Content: {{ content }}
                    """,
            }
        ],
        context={
            "title": story_input.title,
            "main_character": story_input.main_character,
            "content": story_input.content,
        },
    )
    return story.model_dump_json()
