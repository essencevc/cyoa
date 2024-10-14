# Backend for CYOA

## Setup

```shell
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```shell
npx @restatedev/restate-server
hypercorn --config hypercorn-config.toml example:app 
```