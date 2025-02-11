from helpers.db import DatabaseClient
from helpers.s3 import get_story_items
from helpers.story import (
    generate_images,
    generate_story,
    StoryOutline,
    StoryNodes,
    generate_story_choices,
    generate_tts,
)
from datetime import timedelta
from rich import print
import restate
from restate import Workflow, WorkflowContext
from restate.exceptions import TerminalError
from pydantic import BaseModel
from restate.serde import PydanticJsonSerde
import time

story_workflow = Workflow("cyoa")


class StoryInput(BaseModel):
    prompt: str
    user_email: str


def wrap_async_call(coro_fn, *args, **kwargs):
    async def wrapped():
        print(f"Starting {coro_fn.__name__}")
        start_time = time.time()
        result = await coro_fn(*args, **kwargs)
        end_time = time.time()
        print(f"Function {coro_fn.__name__} took {end_time - start_time:.2f} seconds")
        return result

    return wrapped


@story_workflow.main()
async def run(ctx: WorkflowContext, req: StoryInput) -> str:
    print(f"Recieved request: {req}")
    db = DatabaseClient()

    # This will take in a story prompt and then generate a story
    try:
        story: StoryOutline = await ctx.run(
            "Generate Story",
            lambda: generate_story(req.prompt),
            serde=PydanticJsonSerde(StoryOutline),
        )
    except TerminalError as e:
        print(e)
        raise TerminalError("Failed to generate story")

    try:
        story_id = await ctx.run(
            "Insert Story",
            lambda: db.insert_story(story, req.user_email, req.prompt),
        )
    except Exception as e:
        print(e)
        raise TerminalError("Failed to insert story")

    try:
        choices: StoryNodes = await ctx.run(
            "Generate Story Choices",
            wrap_async_call(generate_story_choices, story),
            serde=PydanticJsonSerde(StoryNodes),
        )
    except TerminalError as e:
        print(e)
        raise TerminalError("Failed to generate story choices")

    try:
        await ctx.run(
            "Insert Story Choices",
            lambda: db.insert_story_nodes(choices.nodes, story_id, req.user_email),
        )
    except Exception as e:
        print(e)
        raise TerminalError("Failed to insert story choices")

    try:
        await ctx.run(
            "trigger task",
            wrap_async_call(
                generate_images, choices.nodes, story_id, story.banner_image
            ),
        )
    except Exception as e:
        print(e)
        raise TerminalError("Failed to generate images")

    try:
        await ctx.run(
            "trigger task",
            wrap_async_call(generate_tts, choices.nodes, story_id, story.description),
        )
    except Exception as e:
        print(e)
        raise TerminalError("Failed to generate images")

    iterations = 0

    expected_images = set([node.id for node in choices.nodes] + ["banner"])
    expected_audio = set([node.id for node in choices.nodes] + ["theme"])

    while True:
        # We poll our S3 bucket and wait to see if all the images are there.
        images_and_audio = await ctx.run(
            "Get Story Images", lambda: get_story_items(story_id)
        )

        remaining_images = expected_images - set(images_and_audio["images"])
        remaining_audio = expected_audio - set(images_and_audio["audio"])

        if len(remaining_images) == 0 and len(remaining_audio) == 0:
            break

        iterations += 1
        print(
            f"Iteration {iterations} : {len(remaining_images)} images and {len(remaining_audio)} audio remaining"
        )

        # We wait for at most 10 minutes. If the story is not ready, then we just give up.
        if iterations > 10:
            break

        await ctx.sleep(delta=timedelta(seconds=60))

    try:
        await ctx.run(
            "Mark Story as Completed",
            lambda: db.mark_story_as_completed(story_id),
        )
    except Exception as e:
        print(e)
        raise TerminalError("Failed to mark story as completed")

    return "success"


app = restate.app(
    [story_workflow],
    "bidi",
    identity_keys=[
        "publickeyv1_GTKUcX5ZHNBG3MX9wk7JGwA6VALTGr5UNYika3kyf63e",
        "publickeyv1_wqWhnpRDLYsvBc7d2A9zFhLDfE2iWkukM6ThqZdJ87N",
    ],
)
