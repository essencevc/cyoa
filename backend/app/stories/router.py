from fastapi import APIRouter, Body, Depends, HTTPException
from app.dependencies import get_user_id_from_token, get_db
from libsql_client.sync import ClientSync
from app.models.stories import (
    ResolveStoryInput,
    StoryCreateInput,
    StoryDeleteInput,
    StoryStatus,
)
from app.restate_service.restate_service import (
    kickoff_story_generation,
    generate_story_continuation,
)
import json

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


@router.post("/delete")
def delete_story(
    user_id: str = Depends(get_user_id_from_token),
    client: ClientSync = Depends(get_db),
    story_id: StoryDeleteInput = Body(),
):
    result = client.execute(
        "DELETE FROM story WHERE id = ? AND user_id = ?", [story_id.story_id, user_id]
    )
    print(f"Executing! {result.rows_affected}")
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
        "SELECT id,title,description,status FROM story WHERE id = ? AND user_id = ?",
        [story_id, user_id],
    )
    if len(result_set.rows) != 1:
        raise HTTPException(status_code=404, detail="Story not found")

    id, title, description, status = result_set.rows[0]

    # Fetch all story nodes for the given story_id
    nodes_result_set = client.execute(
        """
        SELECT node_id, parent_node_id, image_url, setting, choices, consumed, starting_choice, story_id,status
        FROM story_node
        WHERE story_id = ?
        """,
        [story_id],
    )

    story_nodes = [
        {
            "node_id": node_id,
            "parent_node_id": parent_node_id,
            "image_url": image_url,
            "setting": setting,
            "choices": json.loads(choices) if choices else None,
            "consumed": bool(consumed),
            "starting_choice": starting_choice,
            "story_id": story_id,
            "status": status,
        }
        for node_id, parent_node_id, image_url, setting, choices, consumed, starting_choice, story_id, status in nodes_result_set.rows
    ]
    return {
        "id": id,
        "title": title,
        "description": description,
        "status": status,
        "story_nodes": story_nodes,
    }


@router.post("/resolve_node")
def resolve_story_node(
    user_id: str = Depends(get_user_id_from_token),
    client: ClientSync = Depends(get_db),
    request: ResolveStoryInput = Body(),
):
    # Query the database to find the node_id for the given story_id and choice
    result = client.execute(
        """
        SELECT node_id
        FROM story_node
        WHERE story_id = ? AND starting_choice = ?
        """,
        [request.story_id, request.choice],
    )

    if not result.rows:
        raise HTTPException(
            status_code=404, detail="No matching node found for the given choice"
        )

    node_id = result.rows[0][0]

    return {"story_id": request.story_id, "node_id": node_id}


@router.get("/{story_id}/{node_id}")
def get_story_node(
    story_id: int,
    node_id: int,
    client: ClientSync = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token),
):
    results = client.execute(
        "SELECT node_id, parent_node_id, image_url, setting, choices, consumed, starting_choice, story_id,status FROM story_node WHERE story_id = ? AND node_id = ?",
        [story_id, node_id],
    )
    if len(results.rows) != 1:
        raise HTTPException(status_code=404, detail="Story Node not found")
    (
        node_id,
        parent_node_id,
        image_url,
        setting,
        choices,
        consumed,
        starting_choice,
        story_id,
        status,
    ) = results.rows[0]
    generate_story_continuation(story_id, node_id)
    # Update the story node as consumed
    client.execute(
        "UPDATE story_node SET consumed = ? WHERE story_id = ? AND node_id = ?",
        [True, story_id, node_id],
    )
    return {
        "story_id": story_id,
        "node_id": node_id,
        "parent_node_id": parent_node_id,
        "image_url": image_url,
        "setting": setting,
        "choices": json.loads(choices) if choices else [],
        "consumed": bool(consumed),
        "status": status,
        "starting_choice": starting_choice,
    }
