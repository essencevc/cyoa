import modal

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("huggingface_hub[hf_transfer]==0.26.2")
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_commands("rm -rf /root/comfy/ComfyUI/models")
)

app = modal.App(name="comfyui-models", image=image)

# Set up model storage
vol = modal.Volume.from_name("comfyui-models", create_if_missing=True)


@app.function(
    volumes={"/root/models": vol},
    secrets=[modal.Secret.from_name("my-huggingface-secret")],
)
def hf_download(repo_id: str, filename: str, model_type: str):
    from huggingface_hub import hf_hub_download

    print(f"Downloading {filename} from {repo_id} to {model_type}")
    hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        local_dir=f"/root/models/{model_type}",
    )


@app.local_entrypoint()
def download_models():
    models_to_download = [
        (
            "black-forest-labs/FLUX.1-dev",
            "ae.safetensors",
            "vae",
        ),
        (
            "black-forest-labs/FLUX.1-dev",
            "flux1-dev.safetensors",
            "unet",
        ),
        (
            "city96/FLUX.1-dev-gguf",
            "flux1-dev-Q5_K_S.gguf",
            "unet",
        ),
        (
            "comfyanonymous/flux_text_encoders",
            "t5xxl_fp8_e4m3fn.safetensors",
            "clip",
        ),
        ("comfyanonymous/flux_text_encoders", "clip_l.safetensors", "clip"),
    ]
    list(hf_download.starmap(models_to_download))
