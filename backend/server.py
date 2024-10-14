from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import Unauthorized
from clerk_backend_api import Clerk
from .services import StoryInput
import requests
import os

RESTATE_RUNTIME_ENDPOINT = os.environ.get("RESTATE_RUNTIME_ENDPOINT")
RESTATE_TOKEN = os.environ.get("RESTATE_TOKEN")
CLERK_BEARER_TOKEN = os.environ.get("CLERK_BEARER_TOKEN")

clerk = Clerk(
    bearer_auth=CLERK_BEARER_TOKEN,
)

app = Flask(__name__)
CORS(app)

def call_restate(workflow_name, data):
    res = requests.post(
        f"{RESTATE_RUNTIME_ENDPOINT}/restate/{workflow_name}",
        data=data,
        headers={"Authorization": f"Bearer {RESTATE_TOKEN}"},
    )
    return res.json()

@app.route('/')
def index():
    return "Hello World"

@app.route('/story', methods=['POST'])
@clerk.requires_auth
def create_story():
    try:
        # Get the authenticated user
        user = clerk.user()
        if not user:
            raise Unauthorized("User not authenticated")

        # Validate and parse the input data
        data = request.json
        input = StoryInput.model_validate_json(data)
        
        # Call the Restate workflow
        workflow_id = call_restate("generate_main_story", input.model_dump())
        
        return jsonify({
            "message": "Story generation started",
            "workflow_id": workflow_id
        }), 202

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Unauthorized as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True)

