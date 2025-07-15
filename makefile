# to run go server
server : 
	@clear && \
	cd backend && \
	go mod tidy && \
	go build -o server cmd/main.go && \
	./server

#to run react on dev mode
dev-client :
	@clear && \
	cd frontend && \
	pnpm dev

# to run react on prod mode
prod-client :
	@clear && \
	cd frontend && \
	pnpm build && \
	pnpm preview --port 5173 

# to run build docker compose
build:
	@clear && \
	( docker image inspect gopod-s >/dev/null 2>&1 && docker rmi gopod-s || true ) && \
	( docker image inspect gopod-c >/dev/null 2>&1 && docker rmi gopod-c || true ) && \
	docker compose -f compose.build.yaml build

# to run production test docker compose
up :
	@clear && \
	docker compose -f compose.yaml up

# to stop production test docker compose
down :
	@clear && \
	docker compose -f compose.yaml down

stack :
	@clear && \
	docker stack deploy -c compose.swarm.yaml gopodstack

# to run containers in watch mode
watch :
	@clear && \
	( docker image inspect gopoddev-s >/dev/null 2>&1 && docker rmi gopoddev-s || true ) && \
	( docker image inspect gopoddev-c >/dev/null 2>&1 && docker rmi gopoddev-c || true ) && \
	docker compose -f compose.watch.yaml up --watch --build

watch-down :
	@clear && \
	docker compose -f compose.watch.yaml down