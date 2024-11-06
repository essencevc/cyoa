FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

WORKDIR /app

# Copy story_service and common folders
COPY ./story_service /app/story_service
COPY ./common /app/common


# Set working directory to where the app will run
WORKDIR /app


RUN uv venv && uv venv activate

RUN uv pip install -r ./story_service/pyproject.toml

# Add hypercorn to PATH
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO

# Add this to ensure Python logs are sent to stdout/stderr
ENV PYTHONIOENCODING=utf-8
# Run the hypercorn server
CMD ["hypercorn", "-c", "./story_service/hypercorn-config.toml", "story_service.app.story:app"]
