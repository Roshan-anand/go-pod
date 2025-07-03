FROM golang:1.24.2-alpine AS builder

WORKDIR /app

COPY go.mod  go.mod
COPY go.sum  go.sum
RUN go mod download

COPY . .
RUN go build -o server ./cmd/main.go

FROM scratch

COPY --from=builder /app/server server

CMD [ "./server" ]