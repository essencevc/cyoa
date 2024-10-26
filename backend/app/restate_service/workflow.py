import restate
from restate.workflow import Workflow
from restate import WorkflowSharedContext
from app.models.stories import RestateStoryInput, GeneratedStory, StoryStatus
from app.settings import env
from restate.exceptions import TerminalError
from libsql_client import create_client_sync
import instructor
import json
from openai import OpenAI

story_workflow = Workflow("cyoa")


@story_workflow.main()
async def run(ctx: WorkflowSharedContext, story_input: RestateStoryInput):
    print(f"Workflow triggered with {story_input}")
    try:
        client = instructor.from_openai(OpenAI())

        story = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": """
                        Generate an interactive story based on the following input:
                        Title: {{ title }}
                        Initial Content: {{ setting }}
                        """,
                }
            ],
            context={
                "title": story_input.title,
                "setting": story_input.setting,
            },
            response_model=GeneratedStory,
        )

        print(story)

        with create_client_sync(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN) as db:
            db.execute(
                "INSERT INTO story_node (story_id, setting, choices, consumed) VALUES (?, ?, ?, ?)",
                [
                    story_input.story_id,
                    story.setting,
                    json.dumps(story.choices),
                    False,
                ],
            )
            db.execute(
                "UPDATE story SET status = ? WHERE id = ?",
                [StoryStatus.COMPLETED.value, story_input.story_id],
            )
            print("Story updated")

    except Exception as e:
        print(e)
        raise TerminalError("Something went wrong.")


app = restate.app(services=[story_workflow])
