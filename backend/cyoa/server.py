import logging
import sys

import requests
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import (VerifyTokenOptions,
                                            authenticate_request, verify_token)
from cyoa.db import DB
from cyoa.settings import env
from cyoa.workflow import StoryContinuationInput, StoryInput
import shortuuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import Unauthorized

logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)
logger = logging.getLogger(__name__)

clerk = Clerk(bearer_auth=env.CLERK_SECRET_KEY)

app = Flask(__name__)

# CORS is disabled, so no middleware is added
CORS(
    app,
    resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": "*",
        }
    },
)

db = DB(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN)


def generate_story_id(user_id):
    return f"{user_id}-{shortuuid.uuid()}"

def generate_story_continuation_id(user_id, story_id):
    return f"{user_id}-{story_id}-{shortuuid.uuid()}"

def call_restate(workflow_name, workflow_id, data):
    if env.RESTATE_TOKEN:
        headers = {"Authorization": f"Bearer {env.RESTATE_TOKEN}"}
    else:
        headers = {}

    try:
        res = requests.post(
            f"{env.RESTATE_RUNTIME_ENDPOINT}/cyoa/{workflow_id}/{workflow_name}/send",
            json=data,
            headers=headers,
            timeout=30,  # Add a timeout of 30 seconds
        )
        res.raise_for_status()  # Raise an exception for non-200 status codes
        return res.json()
    except requests.RequestException as e:
        logger.error(f"Restate call error: {str(e)}", exc_info=True)
        raise Exception(f"Failed to call Restate: {str(e)}")


def get_user_from_token():
    token_options = VerifyTokenOptions(secret_key=env.CLERK_SECRET_KEY)
    resp = authenticate_request(clerk, request, token_options)
    jwt_obj = verify_token(resp.token, token_options)
    return clerk.users.get(user_id=jwt_obj.get("sub"))

def handle_request(handler):
    try:
        user = get_user_from_token()
        data = request.get_json()
        response = handler(user, data)        
        return jsonify(response), 202
    except Unauthorized as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        return jsonify({"error": "Unauthorized"}), 401
    except Exception as e:
        logger.error(f"API request error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 400


@app.route("/stories/<story_id>", methods=["GET"])
def get_story(story_id):
    user = get_user_from_token()
    story = db.get_story(story_id)
    if not story:
        return jsonify({"message": "Story not found"}), 404

    return jsonify({"story": story.model_dump()}), 200

@app.route("/stories", methods=["GET"])
def get_stories():
    user = get_user_from_token()
    stories = db.get_stories_for_user(user.id)
    return jsonify({"stories": stories}), 200


@app.route("/stories", methods=["POST"])
def create_story():
    def handle(user, data):
        # Call the Restate workflow
        input = StoryInput(**data)
        story_id = generate_story_id(user.id)
        response = call_restate("generate_story", story_id, input.model_dump())
        logger.info(f"Successfully created story for user {user.id}")
        return {"story_id": story_id, **response}

    return handle_request(handle)
    

@app.route("/stories/<story_id>/continue", methods=["POST"])
def generate_continuation():
    def handle(user, data):
        # Call the Restate workflow
        input = StoryContinuationInput(**data)
        continue_id = generate_story_continuation_id(user.id, input.story_id)
        logger.debug(f"Continuation story input", input)
        # Call the Restate workflow
        response = call_restate("continue_story", continue_id, input.model_dump())
        return {"story_id": input.story_id, "continue_id": continue_id, **response}

    return handle_request(handle)


if __name__ == "__main__":
    app.run(debug=True)
