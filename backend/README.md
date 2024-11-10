# Introduction

This is a backend service for a story generation app.

We have two main services here

1. `server`: A FastAPI server that serves the frontend and backend APIs
2. `restate`: A Restate server that orchestrates the workflow

There is a third `common` library that contains shared database models and code between the two services.

## Instructions

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

This will help create the database and the necessary tables.
