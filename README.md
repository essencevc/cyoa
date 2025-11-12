# CYOA

Choose Your Own Adventure is a sample repo that shows how you can chain together complex workflows using restate. You can try it at [our hosted version](https://cyoa.dev) if you're curious about how it works.

In this case, we're using restate to create individual choices for a choose your own adventure game, generate unique images for each individual story choice. Instead of having to manually create each service and put a messaging queue in between them ( before adding more complex services to ensure retries and error handling are properly implemented), we can use restate to create a single workflow that can be easily scaled and modified.

This project consists of three main components

1. **Frontend** : This is a simple NextJS application which uses Auth.js for the authentication and Turso for our database.
2. **Modal Services**: With Modal, we deploy two services - an image generation service using ComfyUI with FLUX models, and a text-to-speech service using Kokoro TTS for narration.
3. **Restate Story Service** : We'll be using the restate python sdk to create a workflow that can handle our story generation process.

## Prerequisites

In order to run this project, you'll need the following

- Python 3.12 or higher
- Nodejs 18 or higher
- An AWS account with access to S3.
- A Turso account with a database.
- A Modal account for deploying image and audio generation services.
- A Google API key for accessing Gemini AI.

## Instructions

In this section, we'll be going through the steps to run the project. We'll do so in 3 main portions

Firstly, we'll set up our restate server and setup our restate cloud environment. Next we'll set up our modal services and get our deployment ready. Then, we'll set up our restate story service and get our workflow ready. Lastly, we'll start up our NextJS application and get it ready to use.

1. First, start by cloning the repository

```python
git clone https://github.com/essencevc/cyoa
```

### Setting Up Restate Cloud

1. Next, you'll need to install the restate server. If you're not using a mac, you can install the restate server and cli by following the instructions [here](https://docs.restate.dev/get_started/quickstart/)

```python
brew install restatedev/tap/restate-server
brew install restatedev/tap/restate
```

2. Once you've done so, you'll need to then connect it to your restate cloud account. If you don't have one, you can create an account [here](https://restate.dev/cloud/)

```python
restate cloud login

restate cloud env configure <Environment Name>
restate cloud env tunnel
```

Once you've ran these commands, you'll have a local restate server that has an exposed endpoint that other services can use to send requests to over the internet.

You'll then see something like this

```python
restate cloud environment tunnel - Press Ctrl-C to exit

  💡   Source                  →    💡   Destination
  🤝   tunnel://menu:9082      →    🏠   http://localhost:9080
  🏠   http://localhost:8080   →    🌎   public ingress
  🏠   http://localhost:9070   →    🔒   admin API
```

## Setting Up Modal

Before continuing with this process, you'll need to have a modal account and a aws account. If you don't have one, you can create an account [here](https://modal.com/signup) and [here](https://aws.amazon.com/free/).

You'll need the following credentials so that we can upload our generated images and audio to your s3 bucket.

```bash
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_BUCKET_NAME
```

1. First, you'll need to set up Modal secrets for AWS. Create a Modal secret named `aws-secret` with your AWS credentials:

```bash
modal secret create aws-secret AWS_ACCESS_KEY_ID=<your-key> AWS_SECRET_ACCESS_KEY=<your-secret> AWS_REGION=<your-region> AWS_BUCKET_NAME=<your-bucket>
```

2. Next, you'll need to create a virtual environment for modal and install the dependencies of our project.

```python
cd modal
uv venv
source .venv/bin/activate && uv sync
modal token new # This will create a new token for you
```

3. Download the required models for image generation:

```python
modal run download.py
```

This will download the FLUX models and text encoders needed for image generation.

4. Deploy both the image generation and text-to-speech services:

```python
modal deploy images.py
modal deploy generate_audio.py
```

This should in turn kick off modal deployments. For the image generation service, you should see something like this:

```python
✓ Created objects.
├── 🔨 Created mount workflows/flux.json
├── 🔨 Created mount /Users/ivanleo/Documents/coding/cyoa/modal/images.py
├── 🔨 Created function ComfyUI.*.
└── 🔨 Created web endpoint for ComfyUI.api =>
    <endpoint here>
✓ App deployed in 3.982s! 🎉

View Deployment: <modal service dashboard url>
```

For the text-to-speech service, you should see:

```python
✓ Created objects.
├── 🔨 Created function KokoroGenerator.*.
└── 🔨 Created web endpoint for KokoroGenerator.generate_audio =>
    <endpoint here>
✓ App deployed! 🎉
```

Make sure to note down both endpoint URLs as you'll be using them in your restate story service.

### Setting Up Restate Story Service

Now that we've got our modal web endpoint deployed and our restate cloud environment setup, we can start setting up our restate story service.

1. First, make sure that you're in the restate directory and fill in the following environment variables in a .env file in your restate directory, We'll be reading these variables using our `pydantic` model for it.

```bash
GOOGLE_API_KEY= # Gemini API Key
DB_URL= # Turso Database URL
DB_TOKEN= # Turso Database Token
IMAGE_ENDPOINT= # Modal Image Generation Service Endpoint (from images.py deployment)
KOKORO_ENDPOINT= # Modal Text-to-Speech Service Endpoint (from generate_audio.py deployment)
AWS_ACCESS_KEY_ID= # AWS Access Key ID
AWS_SECRET_ACCESS_KEY= # AWS Secret Access Key
AWS_REGION= # AWS Region (e.g., us-east-1)
```

2. Then run the following command so that our hypercorn server gets configured

```python
python -m hypercorn -c hypercorn-config.toml main:app
```

Once you've done so, you'll see the server starting up locally as seen below.

```python
[2025-01-13 01:10:04 +0800] [11316] [INFO] Running on http://0.0.0.0:9080 (CTRL + C to quit)
[2025-01-13 01:10:04 +0800] [11322] [WARNING] ASGI Framework Lifespan error, continuing without Lifespan support
[2025-01-13 01:10:04 +0800] [11322] [INFO] Running on http://0.0.0.0:9080 (CTRL + C to quit)
```

This means that our restate story service is now ready to be used. We just need to configure our restate cloud environment to use our restate story service. To do so, we'll need to run the following command

```python
restate deployments register <restate cloud local endpoint tunnel> --force
```

This will in turn register our restate story service to our restate cloud environment and we'll be able to use it in our restate cloud environment.

### Setting Up NextJS Application

Now that we've got our restate story service ready, we can start setting up our NextJS application.

1. First, make sure that you're in the frontend directory and run the following command to install the dependencies

```python
bun install
```

2. Next, you'll need to fill in the following environment variables in a .env file in your frontend directory.

```bash
AUTH_SECRET= # Random string for NextAuth.js session encryption
AUTH_GOOGLE_ID= # Google OAuth Client ID
AUTH_GOOGLE_SECRET= # Google OAuth Client Secret
TURSO_CONNECTION_URL= # Turso Database Connection URL
TURSO_AUTH_TOKEN= # Turso Database Auth Token
RESTATE_ENDPOINT= # Restate Cloud Public Ingress Endpoint
RESTATE_TOKEN= # Restate Cloud API Token
```

Once you've done so, you can start the nextjs application by running the following command

```python
bun dev
```

With this, you should be able to see the application running locally and you should be able to start creating your own stories.
