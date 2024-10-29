from restate.workflow import Workflow
from restate import WorkflowContext
from app.models.stories import RestateStoryContinuationInput
from restate.exceptions import TerminalError
from openai import AsyncOpenAI
import instructor
from libsql_client import create_client_sync
from app.settings import env
from app.restate_service.story import generate_story_continuation
from app.modal_service.service import generate_image
import asyncio
import json

continuation_workflow = Workflow("continuation")


@continuation_workflow.main()
async def run(ctx: WorkflowContext, story_input: RestateStoryContinuationInput):
    print(f"Workflow triggered with {story_input}")
    client = instructor.from_openai(AsyncOpenAI())
    try:
        with create_client_sync(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN) as db:
            # Check if there are already child nodes for this parent
            existing_nodes = db.execute(
                "SELECT COUNT(*) FROM story_node WHERE story_id = ? AND parent_node_id = ?",
                [story_input.story_id, story_input.parent_node_id],
            ).rows[0][0]

            if existing_nodes > 0:
                print(
                    f"Child nodes already exist for parent_node_id {story_input.parent_node_id}. Skipping generation."
                )
                return
            result = db.execute(
                "SELECT choices,current_story_summary FROM story_node WHERE story_id = ? AND node_id = ?",
                [story_input.story_id, story_input.parent_node_id],
            )
            if not result.rows:
                raise TerminalError("Story node not found.")

            choices_json, story_summary = result.rows[0]
            choices = json.loads(choices_json)

            coros = []
            for choice in choices:
                coros.append(
                    generate_story_continuation(
                        client,
                        story_input.story_id,
                        story_input.parent_node_id,
                        choice,
                        story_summary,
                    )
                )

            await asyncio.gather(*coros)
    except Exception as e:
        print(e)
        raise TerminalError("Something went wrong.")
