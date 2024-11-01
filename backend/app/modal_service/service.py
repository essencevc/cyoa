import os
import requests
from libsql_client import create_client_sync
from app.settings import env


async def generate_image(prompt: str, story_id: str, node_id: str):
    # Make request to modal endpoint
    response = requests.post(
        env.MODAL_ENDPOINT,
        params={"prompt": prompt},
    )
    response.raise_for_status()
    image_data = response.content

    # Save image to static folder
    image_filename = f"{story_id}_{node_id}.jpg"
    image_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
        "backend",
        "static",
        image_filename,
    )

    with open(image_path, "wb") as f:
        f.write(image_data)

    # Set the URL for database storage
    image_url = f"{env.BACKEND_URL}/static/{image_filename}"

    with create_client_sync(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN) as client:
        client.execute(
            "UPDATE story_node SET image_url = ? WHERE node_id = ? AND story_id = ?",
            (image_url, node_id, story_id),
        )
