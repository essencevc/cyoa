from fastapi import APIRouter, Body, Depends, HTTPException
from sqlmodel import Session
from app.dependencies import get_session, get_user_id_from_token
import random
from common.models import Story, JobStatus, StoryNode
from sqlmodel import select
from app.models.stories import (
    ResolveStoryInput,
    StoryCreateInput,
    StoryDeleteInput,
    RandomStory,
)
from app.restate_service.restate_service import (
    kickoff_story_generation,
    generate_story_continuation,
)

router = APIRouter(
    prefix="/stories",
    tags=["Stories"],
)


@router.post("/")
def create_story(
    user_id: str = Depends(get_user_id_from_token),
    session: Session = Depends(get_session),
    story: StoryCreateInput = Body(),
):
    story = Story(
        user_id=user_id,
        title=story.title,
        description=story.description,
        status=JobStatus.PROCESSING,
    )
    session.add(story)
    session.commit()
    session.refresh(story)

    kickoff_story_generation(story.id, story.title, story.description)

    return {
        "story_id": story.id,
        "status": story.status,
    }


@router.get("/")
def get_stories(
    session: Session = Depends(get_session),
    user_id: str = Depends(get_user_id_from_token),
):
    statement = select(Story).where(Story.user_id == user_id)
    stories = session.exec(statement).all()

    return [
        {
            "id": story.id,
            "title": story.title,
            "description": story.description,
            "status": story.status,
            "updated_at": story.updated_at,
        }
        for story in stories
    ]


@router.post("/delete")
def delete_story(
    user_id: str = Depends(get_user_id_from_token),
    session: Session = Depends(get_session),
    story_id: StoryDeleteInput = Body(),
):
    statement = (
        select(Story)
        .where(Story.id == story_id.story_id)
        .where(Story.user_id == user_id)
    )
    story = session.exec(statement).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    session.delete(story)
    session.commit()

    return {"message": "Story deleted"}


@router.get("/{story_id}")
def get_story(
    story_id: int,
    user_id: str = Depends(get_user_id_from_token),
    session: Session = Depends(get_session),
):
    statement = (
        select(Story).where(Story.id == story_id).where(Story.user_id == user_id)
    )
    story = session.exec(statement).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    statement = select(StoryNode).where(StoryNode.story_id == story_id)
    nodes = session.exec(statement).all()

    print(story, story.id)

    return {
        "id": story.id,
        "title": story.title,
        "description": story.description,
        "status": story.status,
        "story_nodes": [dict(item.model_dump()) for item in nodes],
    }


@router.post("/resolve_node")
def resolve_story_node(
    user_id: str = Depends(get_user_id_from_token),
    session: Session = Depends(get_session),
    request: ResolveStoryInput = Body(),
):
    # Query the database to find the node_id for the given story_id and choice
    statement = (
        select(StoryNode.id)
        .where(StoryNode.story_id == request.story_id)
        .where(StoryNode.starting_choice == request.choice)
    )
    result = session.exec(statement).first()

    if not result:
        raise HTTPException(
            status_code=404, detail="No matching node found for the given choice"
        )

    return {"story_id": request.story_id, "node_id": result}


@router.get("/{story_id}/{node_id}")
def get_story_node(
    story_id: int,
    node_id: int,
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

    generate_story_continuation(story_id, node_id)
    result.consumed = True
    session.add(result)
    session.commit()
    session.refresh(result)

    return {
        "id": node_id,
        "parent_node_id": result.parent_node_id,
        "image_url": result.image_url,
        "setting": result.setting,
        "starting_choice": result.starting_choice,
        "choices": result.choices,
        "consumed": result.consumed,
        "story_id": story_id,
        "status": result.status,
    }


@router.post("/get_random_story")
def get_random_story(
    user_id: str = Depends(get_user_id_from_token),
):
    import instructor
    import openai

    client = instructor.from_openai(openai.OpenAI())

    return client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You're a {{persona}}.  Generate a title and description for a story that will be interesting - note that this is just an introduction to get things going, so it should be short and to the point. Description should be around 2-3 sentences at most",
            },
            {
                "role": "user",
                "content": "Please generate a story that is {{genre}} and {{ adjective}}",
            },
        ],
        context={
            "persona": random.choice(
                [
                    "Expert Storyteller",
                    "1980s Action Hero",
                    "Crossfit Athlete",
                    "Michellin Chef",
                    "Professional Dungeon and Dragon Master",
                ]
            ),
            "genre": random.choice(
                ["fantasy", "sci-fi", "mystery", "horror", "thriller", "comedy"]
            ),
            "adjective": random.choice(
                [
                    "exciting",
                    "funny",
                    "sad",
                    "scary",
                    "surprising",
                ]
            ),
        },
        response_model=RandomStory,
    )
