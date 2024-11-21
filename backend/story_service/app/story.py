from restate.workflow import Workflow
import instructor
import uuid
from restate import WorkflowContext
from story_service.app.models import (
    FinalStory,
    GeneratedStory,
    RestateStoryInput,
    PromptInfo,
)
from restate.serde import PydanticJsonSerde
from rich import print
from datetime import datetime
from restate.exceptions import TerminalError
from story_service.app.helpers import (
    call_modal_endpoint,
    generate_image_prompts,
    rewrite_story,
    log_story_error,
    flatten_and_format_nodes,
    get_db_session,
)
from common.models import Story, JobStatus, StoryNode
from openai import AsyncOpenAI
from story_service.app.helpers import generate_story
from sqlmodel import select
from story_service.app.settings import restate_settings
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
    try:
        story = await ctx.run(
            "Generate Story",
            wrap_async_call(
                coro_fn=generate_story, client=client, story_input=story_input
            ),
            serde=PydanticJsonSerde(model=GeneratedStory),
        )

        rewritten_story = await ctx.run(
            "Rewrite Story Nodes",
            wrap_async_call(
                coro_fn=rewrite_story,
                client=client,
                story=story,
                max_depth=4,
                max_concurrent_requests=10,
            ),
            serde=PydanticJsonSerde(model=FinalStory),
        )
    except TerminalError as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")

    nodes = await ctx.run(
        "Flatten and Format Nodes",
        lambda: [
            item.model_dump(mode="json")
            for item in flatten_and_format_nodes(
                story_input.story_id,
                story_input.user_id,
                rewritten_story.choices,
                None,
                [],
            )
        ],
    )

    try:
        node_image_prompts = await ctx.run(
            "Generate Image Prompts",
            wrap_async_call(
                coro_fn=generate_image_prompts,
                client=client,
                story=story,
                nodes=[StoryNode(**item) for item in nodes],
                max_concurrent_requests=15,
            ),
        )

        node_image_prompts["root"] = {
            "node_id": "root",
            "image_slug": f"{story_input.story_id}/banner.jpg",
            "image_description": story.image_description,
        }

    except TerminalError as t:
        log_story_error(story_input.story_id, t)
        raise TerminalError("Something went wrong")

    # Wait for Modal to process and generate images
    name, promise = ctx.awakeable()
    try:
        callback_url = f"{restate_settings.RESTATE_RUNTIME_ENDPOINT}/restate/awakeables/{name}/resolve"

        await ctx.run(
            "Generate Images",
            wrap_async_call(
                coro_fn=call_modal_endpoint,
                image_prompts=[
                    PromptInfo(**node_image_prompts[node_id])
                    for node_id in node_image_prompts
                ],
                callback_url=callback_url,
            ),
        )
    except TerminalError as t:
        log_story_error(story_input.story_id, t)
        raise TerminalError("Something went wrong")

    await promise

    nodes = [StoryNode(**item) for item in nodes]

    # 5. Generate updated nodes with image_urls
    node_to_s3_image_url = {
        node_id: f"{restate_settings.BUCKET_URL_PREFIX}/{node_image_prompts[node_id]['image_slug']}"
        for node_id in node_image_prompts
    }
    print(node_to_s3_image_url)

    nodes_with_image_url = [
        StoryNode(
            id=uuid.UUID(node.id),
            story_id=uuid.UUID(node.story_id),
            parent_node_id=uuid.UUID(node.parent_node_id)
            if node.parent_node_id
            else None,
            choice_text=node.choice_text,
            image_url=node_to_s3_image_url[str(node.id)],
            setting=node.setting,
            user_id=node.user_id,
            consumed=False,
        )
        for node in nodes
    ]

    print(f"Generated {len(nodes)} images.")

    # 5. Insert Nodes into Database
    try:
        with get_db_session() as session:
            session.add_all(nodes_with_image_url)
            session.commit()
            print(f"Inserted {len(nodes)} nodes into database")

            story = session.exec(
                select(Story).where(Story.id == story_input.story_id)
            ).first()
            story.status = JobStatus.COMPLETED
            story.description = rewritten_story.story_setting
            story.updated_at = datetime.now()
            story.banner_image_url = node_to_s3_image_url["root"]
            session.add(story)
            session.commit()
    except Exception as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")

    print(f"Completed workflow for story {story_input.story_id}")


app = restate.app(services=[story_workflow])
