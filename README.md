# CYOA

Choose Your Own Adventure is a sample repo that shows how you can chain together complex workflows using restate. You can try it at [our hosted version](https://cyoa.dev) if you're curious about how it works.

In this case, we're using restate to create individual choices for a choose your own adventure game, generate unique images for each individual story choice. Instead of having to manually create each service and put a messaging queue in between them ( before adding more complex services to ensure retries and error handling are properly implemented), we can use restate to create a single workflow that can be easily scaled and modified.

This project consists of three main components

1. **Frontend** : This is a simple NextJS application which uses Auth.js for the authentication and Turso for our database.
2. **Modal Services**: With Modal, we can create a single endpoint for image generate that can be easily scaled and modified.
3. **Restate Story Service** : We'll be using the restate python sdk to create a workflow that can handle our story generation process.

## Prerequisites

In order to run this project, you'll need the following

- Python 3.11
- Nodejs 18 or higher
- An AWS account with access to S3.
- A Turso account with a database.

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

You'll need the following credentials so that we can upload our generated images to your s3 bucket.

```bash
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

1. First, you'll need to create a virtual environment for modal and install the dependencies of our project.

```python
cd modal
uv venv
source .venv/bin/activate && uv sync
modal token new # This will create a new token for you
```

2. Once you've done so, then just deploy the image generation service by running the command

```python
modal deploy
```

This should in turn kick off a modal deployment and you should see something like this

```python
(modal) ivanleo@Ivans-MacBook-Pro ~/D/c/c/modal (update-docs)> mod
al deploy images.py
✓ Created objects.
├── 🔨 Created mount workflows/flux.json
├── 🔨 Created mount /Users/ivanleo/Documents/coding/cyoa/modal/images.py
├── 🔨 Created function ComfyUI.*.
└── 🔨 Created web endpoint for ComfyUI.api =>
    <endpoint here>
✓ App deployed in 3.982s! 🎉

View Deployment: <modal service dashboard url>
```

Make sure to note down this endpoint URL as we'll be using it in our restate story service.

### Setting Up Restate Story Service

Now that we've got our modal web endpoint deployed and our restate cloud environment setup, we can start setting up our restate story service.

1. First, make sure that you're in the restate directory and fill in the following environment variables in a .env file in your restate directory, We'll be reading these variables using our `pydantic` model for it.

```bash
GOOGLE_API_KEY= #Gemini API Key
DB_URL= # Turso Database URL
DB_TOKEN= # Turso Database Token
IMAGE_ENDPOINT= # Modal Image Generation Service Endpoint
AWS_ACCESS_KEY_ID= # AWS Access Key ID
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
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

1. First, make sure that you're in the nextjs directory and run the following command to install the dependencies

```python
bun install
```

2. Next, you'll need to fill in the following environment variables in a .env file in your nextjs directory.

```
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
TURSO_CONNECTION_URL=
TURSO_AUTH_TOKEN=
RESTATE_ENDPOINT=
RESTATE_TOKEN=
```

Once you've done so, you can start the nextjs application by running the following command

```python
bun dev
```

With this, you should be able to see the application running locally and you should be able to start creating your own stories.
