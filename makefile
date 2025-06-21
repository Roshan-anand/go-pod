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

dkr-server :
	@clear && \
	cd backend && \
	sudo docker image rm gopod-s && \
	sudo docker build -t gopod-s .


dkr-client :
	@clear && \
	cd frontend && \
	sudo docker image rm gopod-c && \
	sudo docker build -t gopod-c .