from pydantic import BaseModel
import modal
import os

cuda_version = "12.4.0"  # should be no greater than host CUDA version
flavor = "devel"  # includes full CUDA toolkit
operating_sys = "ubuntu22.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"

cuda_dev_image = modal.Image.from_registry(
    f"nvidia/cuda:{tag}", add_python="3.11"
).entrypoint([])

diffusers_commit_sha = "81cf3b2f155f1de322079af28f625349ee21ec6b"

flux_image = (
    cuda_dev_image.apt_install(
        "git",
        "libglib2.0-0",
        "libsm6",
        "libxrender1",
        "libxext6",
        "ffmpeg",
        "libgl1",
    )
    .pip_install(
        "invisible_watermark==0.2.0",
        "transformers==4.44.0",
        "accelerate==0.33.0",
        "safetensors==0.4.4",
        "sentencepiece==0.2.0",
        "torch==2.5.0",
        f"git+https://github.com/huggingface/diffusers.git@{diffusers_commit_sha}",
        "numpy<2",
        "boto3",
        "requests",
        "pydantic",
    )
    .pip_install("huggingface_hub[hf_transfer]")
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
)

app = modal.App("flux-model-batch", image=flux_image)

with flux_image.imports():
    import torch
    from diffusers import FluxPipeline
    from fastapi import Response
    import boto3
    import requests

MINUTES = 60  # seconds
VARIANT = "schnell"  # or "dev", but note [dev] requires you to accept terms and conditions on HF
NUM_INFERENCE_STEPS = 4  # use ~50 for [dev], smaller for [schnell]


class PromptInfo(BaseModel):
    node_id: str
    image_slug: str
    image_description: str


class InferenceInput(BaseModel):
    callback_url: str
    prompts: list[PromptInfo]


@app.cls(
    gpu="A100",
    secrets=[modal.Secret.from_name("aws-secret"), modal.Secret.from_name("restate")],
)
class Model:
    compile: int = (  # see section on torch.compile below for details
        modal.parameter(default=0)
    )

    def setup_model(self):
        from huggingface_hub import snapshot_download
        from transformers.utils import move_cache

        snapshot_download(f"black-forest-labs/FLUX.1-{VARIANT}")

        move_cache()

        pipe = FluxPipeline.from_pretrained(
            f"black-forest-labs/FLUX.1-{VARIANT}", torch_dtype=torch.bfloat16
        )

        return pipe

    @modal.build()
    def build(self):
        self.setup_model()

    @modal.enter()
    def enter(self):
        self.pipe = self.setup_model()
        self.pipe.to("cuda")  # move model to GPU

    @modal.web_endpoint(docs=True, method="POST")
    def inference(self, data: InferenceInput) -> dict:
        print(f"🎨 Generating {len(data.prompts)} images...")

        batch_size = 4

        results = []
        for i in range(0, len(data.prompts), batch_size):
            batch = data.prompts[i : i + batch_size]
            prompts = [prompt.image_description for prompt in batch]
            out = self.pipe(
                prompts,
                output_type="pil",
                num_inference_steps=NUM_INFERENCE_STEPS,
                width=800,
                height=400,
            ).images
            results.extend(out)
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                torch.cuda.ipc_collect()

        s3 = boto3.client("s3")

        for image, prompt_data in zip(results, data.prompts):
            print(f"Saving image for {prompt_data.image_slug}")
            from io import BytesIO

            buffer = BytesIO()
            image.save(buffer, format="PNG")
            image_bytes = buffer.getvalue()

            s3.put_object(
                Bucket=os.getenv("AWS_BUCKET_NAME"),
                Key=prompt_data.image_slug,
                Body=image_bytes,
            )

        restate_token = os.getenv("restate_token")
        print(
            f"Calling callback URL: {data.callback_url} with Restate Token of {restate_token}"
        )
        req = requests.post(
            data.callback_url,
            json={"response": "success"},
            headers={
                "content-type": "application/json",
                "Authorization": f"Bearer {restate_token}",
            },
        )
        print(f"Response: {req}")

        print("✅ Done!")
