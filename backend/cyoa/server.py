from flask import Flask, request, jsonify
from flask_cors import CORS
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import (
    verify_token,
    authenticate_request,
    VerifyTokenOptions,
)
import logging

from cyoa.settings import env
import requests

from cyoa.workflow import StoryInput, StoryContinuationInput

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
        response = handler()        
        return jsonify(response), 202
    except Unauthorized as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        return jsonify({"error": "Unauthorized"}), 401
    except Exception as e:
        logger.error(f"API request error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 400


@app.route("/story", methods=["POST"])
def create_story():
    def handle():
        # Call the Restate workflow
        response = call_restate("generate", input.model_dump())
        logger.info(f"Successfully created story for user {user.id}")
        return response

    return handle_request(handle)
    

@app.route("/continue", methods=["POST"])
def generate_continuation():
    def handle():
        # Call the Restate workflow
        input = StoryContinuationInput(**data)
        logger.debug(f"Continuation story input", input)
        # Call the Restate workflow
        response = call_restate("continue_story", input.model_dump())
        return response

    return handle_request(handle)


if __name__ == "__main__":
    app.run(debug=True)
