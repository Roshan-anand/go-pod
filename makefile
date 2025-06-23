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

# to containerize the server 
dkr-server :
	@clear && \
	cd backend && \
	sudo docker image rm gopod-s && \
	sudo docker build -t gopod-s .

# to containerize the client
dkr-client :
	@clear && \
	cd frontend && \
	sudo docker image rm gopod-c && \
	sudo docker build -t gopod-c .

# to run build docker compose
compose-build:
	@clear && \
	( sudo docker image inspect gopod-s >/dev/null 2>&1 && sudo docker rmi gopod-s || true ) && \
	( sudo docker image inspect gopod-c >/dev/null 2>&1 && sudo docker rmi gopod-c || true ) && \
	sudo docker compose up -d --build

# to run docker compose
compose :
	@clear && \
	sudo docker compose up -d

# to stop docker compose
down :
	@clear && \
	sudo docker compose down