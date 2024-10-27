import requests
from app.settings import env
from uuid import uuid4


def call_restate_service(
    service_name: str, invocation_id: str, service_handler: str, data: dict
):
    print(
        f"{env.RESTATE_RUNTIME_ENDPOINT}/{service_name}/{invocation_id}/{service_handler}/send"
    )
    print(data)
    res = requests.post(
        f"{env.RESTATE_RUNTIME_ENDPOINT}/{service_name}/{invocation_id}/{service_handler}/send",
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
        service_name="cyoa",
        invocation_id=str(uuid4()),
        service_handler="run",
        data={"story_id": str(story_id), "title": title, "setting": setting},
    )


def generate_story_continuation(story_id: str, parent_node_id: str):
    return call_restate_service(
        service_name="continuation",
        invocation_id=str(uuid4()),
        service_handler="run",
        data={"story_id": str(story_id), "parent_node_id": str(parent_node_id)},
    )
