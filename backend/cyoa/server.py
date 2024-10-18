from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import Unauthorized
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import (
    verify_token,
    authenticate_request,
    VerifyTokenOptions,
)

from cyoa import settings
import requests

from cyoa.workflow import StoryInput

clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)

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
    res = requests.post(
        f"{settings.RESTATE_RUNTIME_ENDPOINT}/cyoa/{workflow_name}",
        data=data,
        headers={"Authorization": f"Bearer {settings.RESTATE_TOKEN}"},
    )
    return res.json()


@app.route("/")
def index():
    return "Hello World"


def get_user_from_token():
    token_options = VerifyTokenOptions(secret_key=settings.CLERK_SECRET_KEY)
    resp = authenticate_request(clerk, request, token_options)
    jwt_obj = verify_token(resp.token, token_options)
    return clerk.users.get(user_id=jwt_obj.get("sub"))


@app.route("/story", methods=["POST"])
def create_story():
    try:
        user = get_user_from_token()
        data = request.json
        input = StoryInput(**data)
        # Call the Restate workflow
        workflow_id = call_restate("generate", input.model_dump())

        return jsonify(
            {"message": "Story generation started", "workflow_id": workflow_id}
        ), 202

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Unauthorized as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    app.run(debug=True)
