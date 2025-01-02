import modal
import boto3
from pydantic import BaseModel


def download_model():
    from transformers import pipeline

    pipeline("text-to-audio", model="facebook/musicgen-medium")


image = (
    modal.Image.debian_slim()
    .apt_install("git", "ffmpeg")
    .pip_install("torch", "transformers", "scipy", "boto3", "fastapi")
    .pip_install("requests")
    .run_function(download_model)
)

app = modal.App("audio-service")

# Configure S3 credentials
s3_secret = modal.Secret.from_name("aws-secret")


class AudioRequest(BaseModel):
    prompt: str
    storyId: str
    callback_url: str
    callback_token: str


@app.function(image=image, gpu="A10g", secrets=[s3_secret])
@modal.web_endpoint(method="POST")
def generate_audio(request: AudioRequest):
    # Use a pipeline as a high-level helper
    from transformers import pipeline
    from scipy.io import wavfile
    import tempfile
    import os
    import requests

    print(request)

    pipe = pipeline("text-to-audio", model="facebook/musicgen-medium")
    audio = pipe(
        request.prompt,
        forward_params={"do_sample": True},
    )

    # Write to temporary wav file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        wavfile.write(temp_file.name, audio["sampling_rate"], audio["audio"])

        # Upload to S3
        s3 = boto3.client("s3")
        s3.put_object(
            Bucket=os.getenv("AWS_BUCKET_NAME"),
            Key=f"{request.storyId}/theme_song.wav",
            Body=open(temp_file.name, "rb").read(),
        )

    headers = {"Authorization": f"Bearer {request.callback_token}"}

    requests.post(request.callback_url, headers=headers)
