FROM golang:1.24.2-alpine AS builder

RUN apk update && apk add --no-cache ca-certificates

WORKDIR /server

COPY go.mod  go.mod
COPY go.sum  go.sum
RUN go mod download

COPY . .
RUN go build -o server ./cmd/main.go

FROM scratch

COPY --from=builder /app/server server
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /etc/ssl/certs /etc/ssl/certs

CMD [ "./server" ]