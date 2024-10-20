from __future__ import annotations

import anthropic
import instructor
from cyoa.db import DB
from cyoa.settings import env
from cyoa.models import StoryInput, StoryContinuationInput, StoryNode
from restate.context import WorkflowSharedContext
from restate.workflow import Workflow

story_workflow = Workflow("StoryWorkflow")

db = DB(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN)

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

    #db.save_story(story)
    #return story.model_dump_json()


@story_workflow.handler()
async def generate_continuation(ctx: WorkflowSharedContext, story_input: dict):
    story_input = StoryContinuationInput.model_validate(story_input)
    client = instructor.from_anthropic(
        anthropic.Anthropic(api_key=env.ANTHROPIC_API_KEY)
    )
    response = client.chat.completions.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": """
                You're an expert dungeon master for a tabletop RPG. You're given a setting and a choice the user made. Generate the next part of the story based on the user's choice.

                <previous_setting>
                {{ setting }}
                </previous_setting>

                <previous_choice>
                {{ choice }}
                </previous_choice>

                Make sure to generate a new continuation of the story based on the user's choice. This should be a new scene with a new setting. The new setting should be descriptive and at least 4 sentences long.

                Generate a continuation that is consistent with the story so far. 
                """,
            }
        ],
        # max_tokens=4096,
        response_model=StoryNode,
        context={
            "setting": story_input.previous_setting,
            "choice": story_input.previous_choice,
        },
    )

    #db.save_story(story)
    #return response.model_dump_json()
