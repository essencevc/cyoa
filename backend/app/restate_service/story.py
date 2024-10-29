from libsql_client import create_client_sync
from app.settings import env
from app.models.stories import GeneratedStoryContinuation
import json
from app.modal_service.service import generate_image


async def generate_story_continuation(
    client, story_id: str, parent_node_id: str, user_choice: str, story_summary: str
):
    with create_client_sync(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN) as db:
        result = db.execute(
            """
            INSERT INTO story_node (story_id,parent_node_id,status,starting_choice,status,consumed,setting)
            VALUES (?,?,?,?,?,?,?)
            """,
            [
                story_id,
                parent_node_id,
                "PROCESSING",
                user_choice,
                "PROCESSING",
                False,
                "",
            ],
        )
        node_id = result.last_insert_rowid

        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": """
                    You're a fantasy story writer. You're given a setting and a user choice.
                    You need to generate a continuation of the story based on the user choice.

                    Current Story Setting: {{story_summary}}

                    When faced with this, the user chose: {{user_choice}}

                    Generate a continuation of the story based off the setting and the user choice. 

                    This should include
                    - A new setting that describes what happened as a result of the user choice
                    - A new story summary that describes the current state of the story and takkes into account the user choice
                    - A list of choices that the user can choose from next. Each choice should be a 1-2 sentences at most of a action description.

                    
                    """,
                }
            ],
            response_model=GeneratedStoryContinuation,
            context={
                "story_summary": story_summary,
                "user_choice": user_choice,
            },
        )

        await generate_image(resp.setting, story_id, node_id)

        db.execute(
            """
            UPDATE story_node SET status = ?, setting = ?, choices = ?, current_story_summary = ? WHERE node_id = ?
            """,
            [
                "COMPLETED",
                resp.setting,
                json.dumps(resp.choices),
                resp.current_story_summary,
                node_id,
            ],
        )
