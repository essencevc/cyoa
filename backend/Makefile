run-restate-service:
	hypercorn -c story_service/hypercorn-config.toml story_service.story_workflow:app

update-service:
	restate deployment register localhost:9080 --force --yes

run-restate-server:
	npx @restatedev/restate-server

run-server:
	fastapi dev app/main.py