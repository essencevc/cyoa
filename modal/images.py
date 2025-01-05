import json
import subprocess
import uuid
from pathlib import Path
from typing import Dict

import modal

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .pip_install("comfy-cli==1.2.7", "requests", "boto3")
    .run_commands("comfy --skip-prompt install --nvidia")
    .run_commands("comfy node install was-node-suite-comfyui ComfyUI-GGUF")
    .run_commands(  # needs to be empty for Volume mount to work
        "rm -rf /root/comfy/ComfyUI/models"
    )
)

app = modal.App(name="comfyui-api", image=image)

vol = modal.Volume.from_name("comfyui-models", create_if_missing=True)


@app.cls(
    gpu="A100",
    volumes={"/root/comfy/ComfyUI/models": vol},
    mounts=[
        modal.Mount.from_local_file(
            "workflows/flux.json",
            "/root/flux.json",
        ),
    ],
    secrets=[modal.Secret.from_name("aws-secret")],
    concurrency_limit=5,
)
class ComfyUI:
    @modal.enter()
    def launch_comfy_background(self):
        cmd = "comfy launch --background"
        subprocess.run(cmd, shell=True, check=True)

    @modal.method()
    def infer(self, workflow_path: str = "/root/flux.json"):
        cmd = f"comfy run --workflow {workflow_path} --wait --timeout 1200"
        subprocess.run(cmd, shell=True, check=True)

        output_dir = "/root/comfy/ComfyUI/output"
        workflow = json.loads(Path(workflow_path).read_text())
        file_prefix = [
            node.get("inputs")
            for node in workflow.values()
            if node.get("class_type") == "SaveImage"
            or node.get("class_type") == "SaveAnimatedWEBP"
        ][0]["filename_prefix"]

        for f in Path(output_dir).iterdir():
            if f.name.startswith(file_prefix):
                return f.read_bytes()

    @modal.web_endpoint(method="POST")
    def api(self, node: Dict):
        import boto3
        import os

        workflow_data = json.loads(Path("/root/flux.json").read_text())

        # Update workflow with node prompt
        workflow_data["6"]["inputs"]["text"] = f"""
        8-bit pixel art, limited color palette, dramatic lighting, atmospheric depth, particle effects, industrial aesthetics, contrast between light and shadow. pixels clearly visible.

        {node["prompt"]}
        """

        # Set unique filename prefix
        client_id = uuid.uuid4().hex
        workflow_data["9"]["inputs"]["filename_prefix"] = client_id

        # Save temporary workflow file
        new_workflow_file = f"{client_id}.json"
        json.dump(workflow_data, Path(new_workflow_file).open("w"))

        # Generate image
        img_bytes = self.infer.local(new_workflow_file)

        # Upload to S3
        s3 = boto3.client("s3")
        s3.put_object(
            Bucket=os.getenv("AWS_BUCKET_NAME"),
            Key=f"{node['story_id']}/{node['node_id']}.png",
            Body=img_bytes,
        )

        # Make callback request if callback info is provided
        if "callback_url" in node and "callback_token" in node:
            import requests

            headers = {"Authorization": f"Bearer {node['callback_token']}"}
            requests.post(node["callback_url"], headers=headers)

        return {"status": "success"}
