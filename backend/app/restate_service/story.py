import instructor
from openai import OpenAI
from libsql_client import create_client_sync
from app.settings import env
from app.models.stories import GeneratedStoryContinuation
import json


def generate_story_continuation(
    story_id: str, parent_node_id: str, user_choice: str, story_summary: str
):
    client = instructor.from_openai(OpenAI())

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": """
                You're a fantasy story writer. You're given a setting and a user choice.
                You need to generate a continuation of the story based on the user choice.

                Current Story Setting: {{story_summary}}

                When faced with this, the user chose: {{user_choice}}

                Generate a continuation of the story based off the setting and the user choice. Make sure to keep the story consistent with the setting and the user choice.

                Each choice should be a 1-2 sentences at most of a action description.
                """,
            }
        ],
        response_model=GeneratedStoryContinuation,
        context={
            "story_summary": story_summary,
            "user_choice": user_choice,
        },
    )

    # Import necessary modules

    # Create a database connection
    with create_client_sync(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN) as db:
        # Insert the new story node into the database
        db.execute(
            """
            INSERT INTO story_node 
            (story_id, parent_node_id, setting, choices, current_story_summary, consumed,starting_choice) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                story_id,
                parent_node_id,
                resp.setting,
                json.dumps(resp.choices),
                resp.current_story_summary,
                False,
                user_choice,
            ],
        )
