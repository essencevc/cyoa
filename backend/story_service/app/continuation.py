from restate.workflow import Workflow
from restate import WorkflowContext
from story_service.app.models import RestateStoryContinuationInput
from restate.exceptions import TerminalError
from openai import AsyncOpenAI
import instructor
from story_service.app.helpers import generate_story_continuation
import asyncio
from sqlmodel import select
from common.models import StoryNode
from story_service.app.helpers import get_db_session
from datetime import timedelta

continuation_workflow = Workflow("continuation")


@continuation_workflow.main()
async def run(ctx: WorkflowContext, story_input: RestateStoryContinuationInput):
    print(f"Continuation Workflow triggered with {story_input}")
    client = instructor.from_openai(AsyncOpenAI())

    while True:
        with get_db_session() as session:
            story_node = session.exec(
                select(StoryNode)
                .where(StoryNode.story_id == story_input.story_id)
                .where(StoryNode.id == story_input.parent_node_id)
            ).one_or_none()

            if story_node is None:
                raise TerminalError(
                    f"Story node with id {story_input.parent_node_id} not found."
                )

            if story_node.children:
                print(
                    f"Child nodes already exist for parent_node with id of {story_input.parent_node_id}. Skipping generation."
                )
                return

            if story_node.status == "completed":
                print(f"Story Node {story_node.id} completed. Exiting.")
                break

            if story_node.status == "failed":
                raise TerminalError("Story node generation failed.")

            await ctx.sleep(delta=timedelta(seconds=4))

    try:
        coros = [
            generate_story_continuation(
                client=client,
                story_id=story_input.story_id,
                parent_node_id=story_node.id,
                story_summary=story_node.current_story_summary,
                user_choice=choice,
            )
            for choice in story_node.choices
        ]
        await asyncio.gather(*coros)
    except Exception as e:
        print(f"Encountered error: {e}. Deleting generated nodes.")
        raise TerminalError("Something went wrong.")
