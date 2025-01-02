FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

# Now copy the actual application code
COPY ./server /app/server
COPY ./common /app/common

# Install dependencies without the project
WORKDIR /app/server
RUN uv venv /app/server/.venv
RUN uv pip install -r ./pyproject.toml

CMD ["uv", "run", "fastapi", "run", "app/main.py", "--port", "8000", "--host", "0.0.0.0"]