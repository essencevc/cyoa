import fal_client
from libsql_client import create_client_sync
from app.settings import env


async def generate_image(prompt: str, story_id: str, node_id: str):
    import os

    os.environ["FAL_KEY"] = env.FAL_KEY

    def on_queue_update(update):
        if isinstance(update, fal_client.InProgress):
            if not update.logs:
                return
            for log in update.logs:
                print(log["message"])

    result = await fal_client.subscribe_async(
        "fal-ai/flux/dev",
        arguments={"prompt": prompt, "num_inference_steps": 40},
        on_queue_update=on_queue_update,
    )
    image_url = result["images"][0]["url"]

    with create_client_sync(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN) as client:
        client.execute(
            "UPDATE story_node SET image_url = ? WHERE node_id = ? AND story_id = ?",
            (image_url, node_id, story_id),
        )
