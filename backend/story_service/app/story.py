from restate.workflow import Workflow
from restate import WorkflowContext
from story_service.app.models import RestateStoryInput
import instructor
from rich import print
from datetime import datetime
from restate.exceptions import TerminalError
from story_service.app.helpers import (
    generate_story_images,
    rewrite_story,
    log_story_error,
    flatten_and_format_nodes,
    get_db_session,
    generate_banner_image,
)
from common.models import Story, JobStatus, StoryNode
from openai import AsyncOpenAI
from story_service.app.helpers import generate_story
from sqlmodel import select

import restate
import time


story_workflow = Workflow("cyoa")


@story_workflow.main()
async def run(ctx: WorkflowContext, story_input: RestateStoryInput):
    print(f"Workflow triggered with {story_input}")

    # 1. Initialise Instructor Client
    client = instructor.from_openai(AsyncOpenAI())

    # 2. Generate Story
    try:
        story = await generate_story(client, story_input)
    except Exception as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")

    print("Generated story")
    await ctx.run("Generate Story", lambda: story.model_dump())

    # 3. Rewrite Story nodes
    try:
        rewritten_story = await rewrite_story(
            client, story, max_depth=5, max_concurrent_requests=10
        )
    except Exception as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")

    print("Rewrote Story")
    await ctx.run("Rewrite Story", lambda: rewritten_story.model_dump())

    # 4. Convert to StoryNodes and Generate Images
    nodes = flatten_and_format_nodes(
        story_input.story_id, story_input.user_id, rewritten_story.choices, None, []
    )

    print(f"Generated {len(nodes)} nodes")

    try:
        nodes_to_image_url = await generate_story_images(client, story, nodes, 10)
    except Exception as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")

    await ctx.run("Generate Images", lambda: nodes_to_image_url)

    nodes_with_image_url = [
        StoryNode(
            id=node.id,
            story_id=node.story_id,
            parent_node_id=node.parent_node_id,
            choice_text=node.choice_text,
            image_url=nodes_to_image_url[str(node.id)],
            setting=node.setting,
            user_id=node.user_id,
            consumed=False,
        )
        for node in nodes
    ]

    print(f"Generated {len(nodes)} images.")
    try:
        banner_image_url = await generate_banner_image(
            client, story, story_input.story_id
        )
    except Exception as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")

    await ctx.run("Generate Banner Image", lambda: banner_image_url)

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
            story.banner_image_url = banner_image_url
            session.add(story)
            session.commit()
    except Exception as e:
        log_story_error(story_input.story_id, e)
        raise TerminalError("Something went wrong")

    print(f"Completed workflow for story {story_input.story_id}")


app = restate.app(services=[story_workflow])  #
