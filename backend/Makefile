run-restate-service:
	hypercorn -c story_service/hypercorn-config.toml story_service.app.story:app --log-level info

update-service:
	restate deployment register localhost:9080 --force --yes

run-restate-server:
	npx @restatedev/restate-server

run-server:
	cd server && fastapi dev app/main.py

deploy-restate:	
	fly deploy --config ./story_service/fly.toml --dockerfile ./story_service/Dockerfile --ha=false && \
	fly secrets --config ./story_service/fly.toml import < ./story_service/.env

deploy-server:
	fly deploy --config ./server/fly.toml --dockerfile ./server/Dockerfile --ha=false && \
	fly secrets --config ./server/fly.toml import < ./server/.env

build-server:
	docker build -f server/Dockerfile . -t cyoa-server

run-server-container:
	docker run -p 8000:8000 cyoa-server