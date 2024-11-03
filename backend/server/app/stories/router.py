from fastapi import APIRouter, Depends, Body
from sqlmodel import Session
from server.app.dependencies import get_user_id_from_token, get_session
from server.app.stories.models import StoryCreateInput, StoryCreatePublic, StoryPublic
from common.models import Story, JobStatus
from server.app.helpers.restate import kickoff_story_generation
from sqlmodel import select

router = APIRouter(
    prefix="/stories",
    tags=["Stories"],
)


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

    kickoff_story_generation(story.id, story.title, story.description)

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
