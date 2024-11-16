from restate.workflow import Workflow
from restate import WorkflowContext
from story_service.app.models import RestateStoryInput
import instructor
from rich import print
from restate.exceptions import TerminalError
from story_service.app.helpers import (
    rewrite_story,
    log_story_error,
    flatten_and_format_nodes,
    get_db_session,
)
from common.models import Story, JobStatus
from story_service.app.models import GeneratedStory, FinalStory
from openai import AsyncOpenAI
from story_service.app.helpers import generate_story
from sqlmodel import select

import restate
import time


story_workflow = Workflow("cyoa")


def wrap_async_call(coro_fn, *args, **kwargs):
    async def wrapped():
        start_time = time.time()
        result = await coro_fn(*args, **kwargs)
        end_time = time.time()
        print(f"Function {coro_fn.__name__} took {end_time - start_time:.2f} seconds")
        return result

    return wrapped


@story_workflow.main()
async def run(ctx: WorkflowContext, story_input: RestateStoryInput):
    print(f"Workflow triggered with {story_input}")

    # 1. Initialise Instructor Client
    client = instructor.from_openai(AsyncOpenAI())

    # 2. Generate Instructor Story
    try:
        story = await ctx.run(
            "Generate Story",
            wrap_async_call(
                generate_story,
                **{
                    "client": client,
                    "story_input": story_input,
                },
            ),
        )
        story = GeneratedStory(**story)
    except Exception as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")

    # 2. Recursively Generate the Story
    try:
        rewritten_story = await ctx.run(
            "Rewrite Story",
            wrap_async_call(
                rewrite_story,
                **{"client": client, "story": story, "max_depth": 3},
            ),
        )
        rewritten_story = FinalStory(**rewritten_story)
    except Exception as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")
    import json
    from pathlib import Path

    # Write the rewritten story to a jsonl file for debugging
    story_path = Path("./story.jsonl")
    try:
        with story_path.open("a") as f:
            f.write(json.dumps(rewritten_story.model_dump()) + "\n")
    except Exception as e:
        print(f"Failed to write story to file: {e}")

    # TODO: Debug why this seems to generate so many nodes?? -> Generated a total of 5279060 nodes for max depth of 3. This is wrong, if we look at billing for the entire day it's only been 0.17 so we can't have generated that many nodes.
    nodes = flatten_and_format_nodes(
        story_input.story_id, story_input.user_id, rewritten_story.choices, None, []
    )
    print(f"Generated a total of {len(nodes)} nodes")

    try:
        with get_db_session() as session:
            session.add_all(nodes)
            session.commit()
            print(f"Inserted {len(nodes)} nodes into database")

            story = session.exec(
                select(Story).where(Story.id == story_input.story_id)
            ).first()
            story.status = JobStatus.COMPLETED
            session.add(story)
            session.commit()
    except Exception as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")


app = restate.app(services=[story_workflow])  #
