from common.models import StoryNode, JobStatus
from story_service.app.models import GeneratedStoryContinuation
from story_service.app.settings import restate_settings
from sqlmodel import create_engine, Session
import os
from sqlmodel import select
import requests


def get_db_url():
    return f"sqlite+{restate_settings.LIBSQL_URL}/?authToken={restate_settings.LIBSQL_TOKEN}&secure=true"


def get_db_session():
    engine = create_engine(
        get_db_url(),
        connect_args={"check_same_thread": False},
    )
    return Session(bind=engine)


async def generate_image(prompt: str, story_id: str, node_id: str):
    # Make request to modal endpoint
    response = requests.post(
        restate_settings.MODAL_ENDPOINT,
        params={"prompt": prompt},
    )
    response.raise_for_status()
    image_data = response.content

    # TODO: Move this to use R2
    image_filename = f"{story_id}_{node_id}.jpg"
    image_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
        "backend",
        "static",
        image_filename,
    )

    with open(image_path, "wb") as f:
        f.write(image_data)

    # Set the URL for database storage
    image_url = f"/static/{image_filename}"

    with get_db_session() as session:
        statement = select(StoryNode).where(StoryNode.id == node_id)
        node = session.exec(statement).first()
        node.image_url = image_url
        session.add(node)
        session.commit()


async def generate_story_continuation(
    client, story_id: str, parent_node_id: str, user_choice: str, story_summary: str
):
    with get_db_session() as session:
        story_node = StoryNode(
            story_id=story_id,
            parent_node_id=parent_node_id,
            starting_choice=user_choice,
            status=JobStatus.PROCESSING,
            consumed=False,
            setting=story_summary,
            choices=[],
        )
        session.add(story_node)
        session.commit()
        session.refresh(story_node)
        node_id = story_node.id

    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": """
                You're a fantasy story writer. You're given a setting and a user choice.
                You need to generate a continuation of the story based on the user choice.

                Current Story Setting: {{story_summary}}

                When faced with this, the user chose: {{user_choice}}

                Generate a continuation of the story based off the setting and the user choice. 

                This should include
                - A new setting that describes what happened as a result of the user choice
                - A new story summary that describes the current state of the story and takkes into account the user choice
                - A list of choices that the user can choose from next. Each choice should be a 1-2 sentences at most of a action description.

                
                """,
            }
        ],
        response_model=GeneratedStoryContinuation,
        context={
            "story_summary": story_summary,
            "user_choice": user_choice,
        },
    )

    # await generate_image(resp.setting, story_id, node_id)

    with get_db_session() as session:
        story_node = session.exec(
            select(StoryNode).where(StoryNode.id == node_id)
        ).one()
        story_node.status = JobStatus.COMPLETED
        story_node.setting = resp.setting
        story_node.choices = resp.choices
        story_node.current_story_summary = resp.current_story_summary
        session.commit()
