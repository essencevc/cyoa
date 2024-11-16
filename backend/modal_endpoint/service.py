from io import BytesIO

import modal

cuda_version = "12.4.0"  # should be no greater than host CUDA version
flavor = "devel"  # includes full CUDA toolkit
operating_sys = "ubuntu22.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"

cuda_dev_image = modal.Image.from_registry(
    f"nvidia/cuda:{tag}", add_python="3.11"
).entrypoint([])

diffusers_commit_sha = "81cf3b2f155f1de322079af28f625349ee21ec6b"

flux_image = cuda_dev_image.apt_install(
    "git",
    "libglib2.0-0",
    "libsm6",
    "libxrender1",
    "libxext6",
    "ffmpeg",
    "libgl1",
).pip_install(
    "invisible_watermark==0.2.0",
    "transformers==4.44.0",
    "accelerate==0.33.0",
    "safetensors==0.4.4",
    "sentencepiece==0.2.0",
    "torch==2.5.0",
    f"git+https://github.com/huggingface/diffusers.git@{diffusers_commit_sha}",
    "numpy<2",
)

app = modal.App("flux-endpoint", image=flux_image)

with flux_image.imports():
    import torch
    from diffusers import FluxPipeline
    from fastapi import Response
    from pydantic import BaseModel
MINUTES = 60  # seconds
VARIANT = "schnell"  # or "dev", but note [dev] requires you to accept terms and conditions on HF
NUM_INFERENCE_STEPS = 4  # use ~50 for [dev], smaller for [schnell]


@app.cls(
    gpu="A100",  # fastest GPU on Modal
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
    def inference(self, prompt: str, width: int = 800, height: int = 400) -> bytes:
        print("🎨 generating image...")
        out = self.pipe(
            prompt,
            output_type="pil",
            num_inference_steps=NUM_INFERENCE_STEPS,
            width=width,
            height=height,
        ).images[0]

        byte_stream = BytesIO()
        out.save(byte_stream, format="JPEG")
        return Response(content=byte_stream.getvalue(), media_type="image/jpeg")
