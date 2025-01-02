# Introduction

This is a backend service for a story generation app.

We have four main services here

1. `server`: A FastAPI server that serves the frontend and backend APIs
2. `restate`: A Restate server that orchestrates the workflow
3. `modal_endpoint`: A Modal service that hosts the `flux-1.5-schnell` model on Modal
4. `story_service` : This is a restate service that contains the logic to generate a story.

There is a also a `common` library that contains shared database models and code between the different services. We'll be using Turso as our database and Clerk for authentication.

## Instructions

> These assume that you run them in the `backend` directory.

1. Let's first setup the turso database. If you don't have an account, you can sign up for a free account [here](https://turso.tech/libsql).

> Before running the following step, make sure you have a `.env` file in the `backend` directory which has the following variables:

```
LIBSQL_URL=
LIBSQL_TOKEN=
```

Once you've got these `.env` variables, you can run the following commands to setup the database:

```bash
uv venv
uv pip install -r ./server/pyproject.toml
uv run common/init_db.py
```

This will help create the database and the necessary tables in your turso database.

2. Next, you'll need to setup a S3 bucket to store the generated images. You can create one by following the instructions [here](https://www.simplified.guide/aws/s3/create-public-bucket).

You should have a AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY along with a bucket created by the end of this process above.

3. We'll be using the `flux-1.5-schnell` model to generate the story images. We'll do so using Modal which provides $30 of free credits to run the model with. We'll be using an A100 here so that it runs faster.

```bash
uv pip install modal
cd server
modal deploy service.py
```

This will take roughly 8-10 mins to complete. Once it's done, modal will print out a URL of the deployed service. Your output should look something like this. **We recommend that you note down this URL and that any changes to this service is done through modal's deploy command**. This way, you'll be able to use the cached build steps and limit the time needed to deploy your changes.

```
(backend) ivanleo@Ivans-Mac-mini modal_endpoint % modal deploy service.py
✓ Created objects.
├── 🔨 Created mount
│   /Users/ivanleo/Documents/coding/cyoa/backend/modal_endpoint/service
│   .py
├── 🔨 Created function Model.build.
├── 🔨 Created function Model.*.
└── 🔨 Created web function Model.inference =>
    <Your Endpoint Goes Here>
✓ App deployed in 6.857s! 🎉

View Deployment:
<deployment link>
```

3. Now we need to setup our story service. Make sure you have the following environment variables set in your `.env` file at the path `backend/story_service/.env`.

```
LIBSQL_URL=
LIBSQL_TOKEN=
OPENAI_API_KEY=
MODAL_ENDPOINT=
RESTATE_RUNTIME_ENDPOINT=
BUCKET_URL_PREFIX=
RESTATE_RUNTIME_ENDPOINT=
RESTATE_TOKEN=
```

Bucket URL prefix here is the prefix URL of the S3 Bucket that you added to modal in step 1. This allows us to format the image url to be used in the frontend.

You can run it locally by running the following command

```bash
source .venv/bin/activate
cd backend
make run-restate-service
```

This will run the restate service locally for use.

```bash
[2024-11-18 13:04:22 +0800] [29960] [WARNING] ASGI Framework Lifespan error, continuing without Lifespan support
[2024-11-18 13:04:22 +0800] [29960] [INFO] Running on http://0.0.0.0:9080 (CTRL + C to quit)
[2024-11-18 13:04:22 +0800] [29966] [WARNING] ASGI Framework Lifespan error, continuing without Lifespan support
[2024-11-18 13:04:22 +0800] [29966] [INFO] Running on http://0.0.0.0:9080 (CTRL + C to quit)
```

We'll register this service with restate in step 4 so just make sure that you can run the server for now.

4. Next, you'll need to have restate installed. We are using `restate` cloud for this project because of the long running nature of the workflows. As a result we need to provide a public endpoint for modal to send a callback to.

> You can sign up for a free account here with [Restate Cloud](https://cloud.restate.dev/). Once you've done so, just set up a new project and get an API Key along with your public endpoint.

```
restate cloud login
restate cloud env configure <profile/environment>
restate cloud env tunnel
```

This will setup a local tunnel to your restate cloud environment that you can use to register your services.

```

  💡   Source                  →    💡   Destination
  🤝   tunnel://puma:9081      →    🏠   http://localhost:9080
  🏠   http://localhost:8080   →    🌎   public ingress
  🏠   http://localhost:9070   →    🔒   admin API

  💡   To discover:
       restate deployments register tunnel://puma:9081
       The deployment is only reachable from this Restate Cloud enviro
```

Make sure to update the Makefile with your restate cloud endpoint as seen below.

```
update-service:
	restate deployment register <Source For Tunnel 9080> --force --yes
```

Then run the following command to register your service with restate.

```bash
make update-service
```

This will register your service with restate and allow the workflow to be triggered.

5. Finally, let's start the server. We'll need to have the following `.env` variable set in the `server/.env` file.

```env
RESTATE_RUNTIME_ENDPOINT=
RESTATE_TOKEN=
CLERK_SECRET_KEY=
LIBSQL_URL=
LIBSQL_TOKEN=
MODAL_ENDPOINT=
OPENAI_API_KEY=
```

Once you've setup these variables, you can run the following command to start the server.

```bash
make run-server
```

And with that we have a working backend server! It took a lot of steps but let's see how we could do more.
