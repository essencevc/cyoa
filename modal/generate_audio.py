import modal

kokoro_volume = modal.Volume.from_name("kokoro-volume", create_if_missing=True)


image = (
    modal.Image.debian_slim()
    .apt_install("git", "ffmpeg", "espeak-ng", "git-lfs")
    .pip_install(
        "torch", "transformers", "scipy", "boto3", "fastapi", "phonemizer", "munch"
    )
    .pip_install("requests", "ipython")
)

app = modal.App("kokoro-tts", image=image)


@app.function(volumes={"/kokoro_volume": kokoro_volume})
def download_kokoro():
    import os

    if not os.path.exists("/kokoro_volume/Kokoro-82M"):
        os.system("git clone https://huggingface.co/hexgrad/Kokoro-82M /kokoro_volume")


@app.cls(
    gpu="T4",
    volumes={"/kokoro_volume": kokoro_volume},
    secrets=[modal.Secret.from_name("aws-secret")],
    concurrency_limit=2,
)
class KokoroGenerator:
    @modal.enter()
    def load_model(self):
        import os
        import sys
        import torch

        os.chdir("/kokoro_volume")
        sys.path.append(".")
        from kokoro import generate
        from models import build_model

        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.MODEL = build_model("kokoro-v0_19.pth", device)
        self.VOICE_NAME = "bm_lewis"
        self.VOICEPACK = torch.load(
            f"voices/{self.VOICE_NAME}.pt", weights_only=True
        ).to(device)
        self.generate_fn = generate

    @modal.web_endpoint(method="POST", requires_proxy_auth=True)
    def generate_audio(self, node: dict):
        import boto3
        import os
        import tempfile
        from scipy.io import wavfile

        audio, out_ps = self.generate_fn(
            self.MODEL, node["prompt"], self.VOICEPACK, lang="b"
        )

        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp_file:
            wavfile.write(tmp_file.name, rate=22050, data=audio)
            tmp_file.flush()
            tmp_file.seek(0)
            audio_bytes = tmp_file.read()

        s3 = boto3.client("s3")
        s3.put_object(
            Bucket=os.getenv("AWS_BUCKET_NAME"),
            Key=f"{node['story_id']}/{node['node_id']}.wav",
            Body=audio_bytes,
        )
