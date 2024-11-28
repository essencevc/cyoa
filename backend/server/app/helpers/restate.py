import requests
from server.app.settings import env
import urllib.parse


def call_restate_service(
    service_name: str, invocation_id: str, service_handler: str, data: dict
):
    url = f"{env.RESTATE_RUNTIME_ENDPOINT}/{service_name}/{invocation_id}/{service_handler}/send"
    response = requests.post(
        url,
        json=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {env.RESTATE_TOKEN}",
        },
    )

    # Check if the response is successful and contains JSON data
    if response.status_code == 200:
        try:
            return response.json()
        except ValueError as e:
            print(f"Error parsing JSON: {e}")
            print(f"Response content: {response.text}")
            return None
    else:
        print(f"Request failed with status code {response.status_code}")
        print(f"Response content: {response.text}")
        return None


def kickoff_story_generation(story_id: int, title: str, setting: str, user_id: str):
    return call_restate_service(
        service_name="cyoa",
        invocation_id=story_id,
        service_handler="run",
        data={
            "story_id": str(story_id),
            "title": title,
            "setting": setting,
            "user_id": user_id,
        },
    )
