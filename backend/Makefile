run-restate-service:
	hypercorn -c app/restate_service/hypercorn-config.toml app.restate_service.workflow:app

update-service:
	restate deployment register localhost:9080 --force --yes

run-restate-server:
	npx @restatedev/restate-server