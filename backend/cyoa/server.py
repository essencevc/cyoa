from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import Unauthorized
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import (
    verify_token,
    authenticate_request,
    VerifyTokenOptions,
)

from cyoa.settings import env
import requests

from cyoa.workflow import StoryInput

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
    res = requests.post(
        f"{env.RESTATE_RUNTIME_ENDPOINT}/cyoa/{workflow_name}",
        json=data,
        headers={"Authorization": f"Bearer {env.RESTATE_TOKEN}"},
    )
    return res.json()


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
        data = request.json
        input = StoryInput(**data)
        print(input)
        # Call the Restate workflow
        response = call_restate("generate", input.model_dump())

        return jsonify(response), 202
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
