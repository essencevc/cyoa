FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    cmake \
    pkg-config \
    && rm -rf /var/lib/apt/lists/* \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y


ENV PATH="/root/.cargo/bin:$PATH"


WORKDIR /app

# Copy all files to app directory
COPY ./ /app

RUN uv venv && uv venv activate

RUN uv pip install -r pyproject.toml

# Add hypercorn to PATH
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO

# Add this to ensure Python logs are sent to stdout/stderr
ENV PYTHONIOENCODING=utf-8
# Run the hypercorn server
CMD ["hypercorn", "-c", "hypercorn-config.toml", "main:app"]
