from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import Unauthorized
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import (
    verify_token,
    authenticate_request,
    VerifyTokenOptions,
)
import traceback
import logging

from cyoa.settings import env
import requests

from cyoa.workflow import StoryInput

# Set up logging
logging.basicConfig(level=logging.INFO)
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


def call_restate(workflow_name, data):
    try:
        res = requests.post(
            f"{env.RESTATE_RUNTIME_ENDPOINT}/cyoa/{workflow_name}",
            json=data,
            headers={"Authorization": f"Bearer {env.RESTATE_TOKEN}"},
            timeout=30  # Add a timeout of 30 seconds
        )
        res.raise_for_status()  # Raise an exception for non-200 status codes
        return res.json()
    except requests.RequestException as e:
        logger.error(f"Restate call error: {str(e)}", exc_info=True)
        raise Exception(f"Failed to call Restate: {str(e)}")


@app.route("/")
def index():
    return "Hello World"


def get_user_from_token():
    token_options = VerifyTokenOptions(secret_key=env.CLERK_SECRET_KEY)
    resp = authenticate_request(clerk, request, token_options)
    jwt_obj = verify_token(resp.token, token_options)
    return clerk.users.get(user_id=jwt_obj.get("sub"))


@app.route("/story", methods=["POST"])
def create_story():
    try:
        user = get_user_from_token()
        data = request.get_json()
        input = StoryInput(**data)
        # Call the Restate workflow
        response = call_restate("generate", input.model_dump())
        logger.info(f"Successfully created story for user {user.id}")

        return jsonify(response), 202
    except Unauthorized as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        return jsonify({"error": "Unauthorized"}), 401
    except Exception as e:
        logger.error(f"API request error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
