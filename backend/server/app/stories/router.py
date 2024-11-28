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
    StoryNodePublic,
)
from common.models import Story, JobStatus, StoryNode
from server.app.settings import env
from server.app.helpers.restate import (
    kickoff_story_generation,
)
from sqlmodel import select
import logging
from uuid import UUID, uuid4
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
    statement = select(Story).where(Story.id == story_id)
    story = session.exec(statement).first()

    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    if story.user_id != user_id and not story.is_public:
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
        public=story.public,
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
    try:
        kickoff_story_generation(story.id, story.title, story.description, user_id)
    except Exception as e:
        logger.error(f"Error kicking off story generation: {e}")
        raise HTTPException(
            status_code=500, detail="Error kicking off story generation"
        )

    session.commit()
    session.refresh(story)

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

    res = [StoryPublic(**story.model_dump()) for story in stories]
    print(res)
    return res


@router.post("/toggle_visibility")
def toggle_visibility(
    story_id: UUID,
    user_id: str = Depends(get_user_id_from_token),
    session: Session = Depends(get_session),
):
    statement = select(Story).where(Story.id == story_id, Story.user_id == user_id)
    story = session.exec(statement).first()

    if not story:
        raise ValueError("Story not found")

    # Toggle visibility
    story.public = not story.public

    # Save changes to database
    session.commit()
    session.refresh(story)

    return {"message": "ok"}


@router.post("/copy")
def copy_story(
    story_id: UUID,
    user_id: str = Depends(get_user_id_from_token),
    session: Session = Depends(get_session),
) -> StoryCreatePublic:
    # Get original story
    statement = select(Story).where(Story.id == story_id)
    original_story = session.exec(statement).first()

    if not original_story:
        raise HTTPException(status_code=404, detail="Story not found")

    if not original_story.is_public:
        raise HTTPException(status_code=403, detail="Unable to copy private story")

    # Create new story copy
    new_story = Story(
        user_id=user_id,
        title=original_story.title,
        description=original_story.description,
        status=JobStatus.COMPLETED,
    )
    session.add(new_story)
    session.refresh(new_story)

    # Get all nodes from original story
    node_statement = select(StoryNode).where(StoryNode.story_id == story_id)
    original_nodes = session.exec(node_statement).all()

    # Create mapping of old node IDs to new node IDs
    id_mapping = {}

    # Generate new UUIDs for new nodes
    for node in original_nodes:
        id_mapping[node.id] = uuid4()

    for node in original_nodes:
        new_node = StoryNode(
            id=id_mapping[node.id],
            story_id=new_story.id,
            choice_text=node.choice_text,
            parent_node_id=None
            if not node.parent_node_id
            else id_mapping[node.parent_node_id],
            image_url=node.image_url,
            setting=node.setting,
            consumed=False,
            story=new_story,
        )
        session.add(new_node)

    session.commit()

    return StoryCreatePublic(
        id=new_story.id,
        status=new_story.status,
    )


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

    story_creator = result.user_id
    if story_creator == user_id:
        result.consumed = True

    statement = select(Story).where(Story.id == story_id)
    story = session.exec(statement).first()

    if user_id != story.user_id and not story.is_public:
        raise HTTPException(status_code=401, detail="Not authorized to view story")

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
        public=story.public,
        children=[
            StoryNodePublic(
                id=child.id,
                choice_text=child.choice_text,
                parent_node_id=child.parent_node_id,
                image_url=child.image_url,
                setting=child.setting,
                consumed=child.consumed,
                children=[],
                public=story.public,
            )
            for child in result.children
        ],
    )
