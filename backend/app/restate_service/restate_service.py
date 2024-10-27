import requests
from app.settings import env
from uuid import uuid4


def call_restate_service(workflow_id: str, workflow_name: str, data: dict):
    res = requests.post(
        f"{env.RESTATE_RUNTIME_ENDPOINT}/cyoa/{workflow_id}/{workflow_name}/send",
        json=data,
        headers={
            "Content-Type": "application/json",
        },
    )
    res.raise_for_status()
    resp = res.json()
    return resp


def kickoff_story_generation(story_id: str, title: str, setting: str):
    return call_restate_service(
        workflow_id=str(uuid4()),
        workflow_name="run",
        data={"story_id": str(story_id), "title": title, "setting": setting},
    )


def generate_story_continuation(story_id: str, parent_node_id: str, choice: str):
    return call_restate_service(
        workflow_id=str(uuid4()),
        workflow_name="generate",
        data={
            "story_id": str(story_id),
            "parent_node_id": parent_node_id,
            "choice": choice,
        },
    )
