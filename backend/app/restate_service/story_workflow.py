import restate
from restate.workflow import Workflow
from restate import WorkflowContext
from app.models.stories import RestateStoryInput, GeneratedStory
from restate.exceptions import TerminalError
import instructor
import asyncio
from app.restate_service.story import generate_story_continuation
from app.restate_service.continuation_workflow import continuation_workflow
from app.image_service.service import generate_image
from openai import AsyncOpenAI
from app.db.models import JobStatus, StoryNode
from app.db.helpers import get_db_session


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

        print("Generated Story", story)

        ctx.set("generated_story", story.model_dump())

        with get_db_session() as session:
            story_node = StoryNode(
                story_id=story_input.story_id,
                setting=story.setting,
                current_story_summary=story.setting,
                choices=story.choices,
                consumed=False,
                starting_choice=story.setting,
                status=JobStatus.PROCESSING,
            )

            session.add(story_node)
            session.commit()
            session.refresh(story_node)

            coros = [
                generate_story_continuation(
                    client,
                    story_id=story_input.story_id,
                    parent_node_id=story_node.id,
                    user_choice=choice,
                    story_summary=story.setting,
                )
                for choice in story.choices
            ]
            coros.append(
                generate_image(story.setting, story_input.story_id, story_node.id)
            )
            await asyncio.gather(*coros)

            story_node.status = JobStatus.COMPLETED
            story_node.consumed = True

            from sqlmodel import select
            from app.db.models import Story

            statement = select(Story).where(Story.id == story_input.story_id)
            story = session.exec(statement).first()
            story.status = JobStatus.COMPLETED
            session.add(story)
            session.commit()
            print("Story Workflow Completed")
    except Exception as e:
        print(e)
        raise TerminalError("Something went wrong.")


app = restate.app(services=[story_workflow, continuation_workflow])
