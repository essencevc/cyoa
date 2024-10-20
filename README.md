# CYOA

cyoa is a sample repo that shows how to build a choose your own adventure game with restate, vite and clerk.

## Instructions

> You need to have four different processes running for this to work at the moment. This will be simplified in the future.

1. First, you'll need to start the frontend server and log in with clerk.

```
cd frontend
npm install
npm run start
```

Make sure that at this point you've got the necessary environment variables set in your `.env` file.

```
VITE_CLERK_PUBLISHABLE_KEY=<your-key>
```

You can get a key by creating an application in the clerk dashboard.

2. Next, you'll need to start our flask server and install the required dependencies. We recommend using a virtual environment for this.

```
cd backend
pip install -r requirements.txt
make run-server
```

Make sure that you've set the required environment variables in your `.env` file.

```
ANTHROPIC_API_KEY=
LIBSQL_TOKEN=
LIBSQL_URL=
CLERK_SECRET_KEY=
RESTATE_RUNTIME_ENDPOINT=
RESTATE_TOKEN=
```

3. Once you've done so, you can then start the restat workflow which generates the stories and different choices.

In a separate window, run the following command to start the restate workflow.

```
make run-cyoa
```

4. Lastly, you need to start the restate runtime and register the workflow with the runtime.

```
npx @restatedev/restate-server
restate deployments register http://localhost:9080
```

Now that you've done all of this, you should be able to navigate to the frontend and start playing the game!
