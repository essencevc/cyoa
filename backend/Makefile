run-restate-service:
	hypercorn -c story_service/hypercorn-config.toml story_service.app.story:app --log-level info

update-service:
	restate deployment register tunnel://dexter:9082 --force --yes

update-hosted-service:
	restate deployment register https://story-service.fly.dev --force --yes

run-restate-server:
	npx @restatedev/restate-server

run-server:
	cd server && fastapi dev app/main.py

deploy-restate:	
	fly deploy --config ./story_service/fly.toml --ha=false && \
	fly secrets --config ./story_service/fly.toml import < ./story_service/.env

deploy-server:
	fly deploy --config ./server/fly.toml --ha=false && \
	fly secrets --config ./server/fly.toml import < ./server/.env

build-server:
	docker build -f server/Dockerfile . -t cyoa-server

run-server-container:
	docker run -p 8000:8000 cyoa-server