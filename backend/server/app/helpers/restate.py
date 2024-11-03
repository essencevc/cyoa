import requests
from server.app.settings import env
import urllib.parse


def call_restate_service(
    service_name: str, invocation_id: str, service_handler: str, data: dict
):
    url = f"{env.RESTATE_RUNTIME_ENDPOINT}/{service_name}/{invocation_id}/{service_handler}/send"
    return requests.post(
        url,
        json=data,
        headers={"Content-Type": "application/json"},
    ).json()


def kickoff_story_generation(story_id: int, title: str, setting: str):
    invocation_id = (
        f"story-{story_id}-{urllib.parse.quote(title)}-{urllib.parse.quote(setting)}"
    )
    return call_restate_service(
        service_name="cyoa",
        invocation_id=invocation_id,
        service_handler="run",
        data={"story_id": str(story_id), "title": title, "setting": setting},
    )


def generate_story_continuation(story_id: str, parent_node_id: str):
    invocation_id = f"story-continuation-{story_id}-{parent_node_id}"
    return call_restate_service(
        service_name="continuation",
        invocation_id=invocation_id,
        service_handler="run",
        data={"story_id": str(story_id), "parent_node_id": str(parent_node_id)},
    )
