from fastapi import APIRouter, Body, Depends, HTTPException
from app.dependencies import get_user_id_from_token, get_db
from libsql_client.sync import ClientSync
from app.models.stories import StoryCreateInput, StoryStatus
from app.restate_service.restate_service import kickoff_story_generation


router = APIRouter(
    prefix="/stories",
    tags=["Stories"],
)


@router.post("/")
def create_story(
    user_id: str = Depends(get_user_id_from_token),
    client: ClientSync = Depends(get_db),
    story: StoryCreateInput = Body(),
):
    result_set = client.execute(
        "INSERT INTO story (user_id, title, description, status) VALUES (?, ?, ?, ?)",
        [user_id, story.title, story.description, StoryStatus.SUBMITTED.value],
    )
    story_id = result_set.last_insert_rowid
    kickoff_story_generation(story_id, story.title, story.description)
    return {"story_id": story_id, "status": "submitted"}


@router.get("/")
def get_stories(
    client: ClientSync = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token),
):
    result_set = client.execute(
        "SELECT id,title,description,status,updated_at FROM story WHERE user_id = ?",
        [user_id],
    )

    return [
        {
            "id": id,
            "title": title,
            "description": description,
            "status": status,
            "updated_at": updated_at,
        }
        for id, title, description, status, updated_at in result_set.rows
    ]


@router.post("/delete/{story_id}")
def delete_story(
    story_id: int,
    client: ClientSync = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token),
):
    result = client.execute(
        "DELETE FROM story WHERE id = ? AND user_id = ?", [story_id, user_id]
    )
    if result.rows_affected == 0:
        raise HTTPException(
            status_code=404, detail="Story not found or not owned by the user"
        )
    return {"message": "Story deleted"}


@router.get("/{story_id}")
def get_story(
    story_id: int,
    client: ClientSync = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token),
):
    result_set = client.execute(
        "SELECT id,title,description,status,updated_at FROM story WHERE id = ? AND user_id = ?",
        [story_id, user_id],
    )
    if len(result_set.rows) != 1:
        raise HTTPException(status_code=404, detail="Story not found")

    id, title, description, status, updated_at = result_set.rows[0]
    return {
        "id": id,
        "title": title,
        "description": description,
        "status": status,
        "updated_at": updated_at,
    }
