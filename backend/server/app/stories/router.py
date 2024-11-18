from fastapi import APIRouter, Depends, Body, HTTPException
from sqlmodel import Session
from server.app.dependencies import get_user_id_from_token, get_session
from server.app.stories.models import (
    StoryCreateInput,
    StoryCreatePublic,
    StoryPublic,
    StoryDeleteInput,
    StorySelectPublic,
    RandomStory,
    StoryResolveNodeInput,
    StoryResolveNodePublic,
    StoryNodePublic,
)
from common.models import Story, JobStatus, StoryNode
from server.app.settings import env
from server.app.helpers.restate import (
    kickoff_story_generation,
)
from sqlmodel import select
import logging
from uuid import UUID
import random
import instructor
import openai

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/stories",
    tags=["Stories"],
)


@router.post("/get_random_story")
def get_random_story(
    user_id: str = Depends(get_user_id_from_token),
):
    client = instructor.from_openai(openai.OpenAI(api_key=env.OPENAI_API_KEY))

    return client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Generate a title and description for a story that will be interesting - note that this is just an introduction to get things going, so it should be short and to the point. Description should be around 2-3 sentences at most",
            },
            {
                "role": "user",
                "content": "Please generate a story that is {{genre}} and {{ adjective}}",
            },
        ],
        context={
            "genre": random.choice(["fantasy", "sci-fi", "thriller", "comedy"]),
            "adjective": random.choice(
                [
                    "exciting",
                    "funny",
                    "surprising",
                ]
            ),
        },
        response_model=RandomStory,
    )


@router.get("/{story_id}")
def get_story(
    story_id: UUID,
    user_id: str = Depends(get_user_id_from_token),
    session: Session = Depends(get_session),
):
    statement = select(Story).where(Story.id == story_id, Story.user_id == user_id)
    story = session.exec(statement).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    statement = select(StoryNode).where(StoryNode.story_id == story_id)
    nodes = session.exec(statement).all()

    return StorySelectPublic(
        id=story.id,
        title=story.title,
        description=story.description,
        status=story.status,
        story_nodes=nodes,
        updated_at=story.updated_at,
        banner_image_url=story.banner_image_url,
    )


@router.post("/delete")
def delete_story(
    story_id: StoryDeleteInput = Body(),
    session: Session = Depends(get_session),
    user_id: str = Depends(get_user_id_from_token),
):
    try:
        statement = select(Story).where(
            Story.id == story_id.id, Story.user_id == user_id
        )
        story = session.exec(statement).first()
        session.delete(story)
        session.commit()
    except Exception as e:
        logger.error(f"Error deleting story: {e}")
        raise HTTPException(status_code=404, detail="Story not found")


@router.post("/")
def create_story(
    user_id: str = Depends(get_user_id_from_token),
    session: Session = Depends(get_session),
    story: StoryCreateInput = Body(),
) -> StoryCreatePublic:
    story = Story(
        user_id=user_id,
        title=story.title,
        description=story.description,
        status=JobStatus.PROCESSING,
    )

    session.add(story)
    session.commit()
    session.refresh(story)

    kickoff_story_generation(story.id, story.title, story.description, user_id)

    return StoryCreatePublic(
        id=story.id,
        status=story.status,
    )


@router.get("/")
def get_stories(
    user_id: str = Depends(get_user_id_from_token),
    session: Session = Depends(get_session),
) -> list[StoryPublic]:
    statement = select(Story).where(Story.user_id == user_id)
    stories = session.exec(statement).all()

    return [StoryPublic(**story.model_dump()) for story in stories]


@router.get("/{story_id}/{node_id}")
def get_story_node(
    story_id: UUID,
    node_id: UUID,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_user_id_from_token),
):
    statement = (
        select(StoryNode)
        .where(StoryNode.story_id == story_id)
        .where(StoryNode.id == node_id)
    )
    result = session.exec(statement).first()
    if not result:
        raise HTTPException(status_code=404, detail="Story Node not found")

    result.consumed = True
    session.add(result)
    session.commit()
    session.refresh(result)
    return StoryNodePublic(
        id=result.id,
        choice_text=result.choice_text,
        parent_node_id=result.parent_node_id,
        image_url=result.image_url,
        setting=result.setting,
        consumed=result.consumed,
        children=[
            StoryNodePublic(
                id=child.id,
                choice_text=child.choice_text,
                parent_node_id=child.parent_node_id,
                image_url=child.image_url,
                setting=child.setting,
                consumed=child.consumed,
                children=[],
            )
            for child in result.children
        ],
    )
