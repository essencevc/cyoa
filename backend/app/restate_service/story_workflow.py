import restate
from restate.workflow import Workflow
from restate import WorkflowContext
from app.models.stories import RestateStoryInput, GeneratedStory, StoryStatus
from app.settings import env
from restate.exceptions import TerminalError
from libsql_client import create_client_sync
import instructor
import asyncio
import json
from app.restate_service.story import generate_story_continuation
from app.restate_service.continuation_workflow import continuation_workflow
from app.modal_service.service import generate_image
from openai import AsyncOpenAI

story_workflow = Workflow("cyoa")


@story_workflow.main()
async def run(ctx: WorkflowContext, story_input: RestateStoryInput):
    print(f"Workflow triggered with {story_input}")
    try:
        client = instructor.from_openai(AsyncOpenAI())

        story = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": """
                        Generate an interactive story based on the following input:
                        Title: {{ title }}
                        Initial Content: {{ setting }}

                        Make sure to write a descriptive setting for the story that will set up an interesting list of choices for the user. This should be at most 1 paragraph.
                        """,
                }
            ],
            context={
                "title": story_input.title,
                "setting": story_input.setting,
            },
            response_model=GeneratedStory,
        )

        ctx.set("generated_story", story.model_dump())
        print(f"Generated story: {story}")

        with create_client_sync(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN) as db:
            result = db.execute(
                "INSERT INTO story_node (story_id, setting, choices, consumed, starting_choice,status) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    story_input.story_id,
                    story.setting,
                    json.dumps(story.choices),
                    False,
                    story.setting,
                    "PROCESSING",
                ],
            )
            node_id = result.last_insert_rowid

            coros = [
                generate_story_continuation(
                    client, story_input.story_id, node_id, choice, story.setting
                )
                for choice in story.choices
            ]
            coros.append(generate_image(story.setting, story_input.story_id, node_id))
            await asyncio.gather(*coros)
            db.execute(
                "UPDATE story SET status = ? WHERE id = ?",
                [StoryStatus.COMPLETED.value, story_input.story_id],
            )
            db.execute(
                "UPDATE story_node SET status = ?, consumed = ? WHERE node_id = ?",
                ["COMPLETED", True, node_id],
            )
            print("Story updated")

    except Exception as e:
        print(e)
        raise TerminalError("Something went wrong.")


app = restate.app(services=[story_workflow, continuation_workflow])
