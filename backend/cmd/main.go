package main

import (
	"fmt"
	"net/http"

	"github.com/Roshan-anand/go-pod/internal/config"
	"github.com/Roshan-anand/go-pod/internal/middleware"
	"github.com/Roshan-anand/go-pod/internal/routes"
	"github.com/Roshan-anand/go-pod/internal/socket"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	config.SetIceConfig() // setting up the ICE configuration for WebRTC

	// starting a new WebSocket hub
	hub := socket.NewHub()
	go hub.Run()

	// setting up rotes
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Hello, World!"))
	})

	//routes for making a websocket connection
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		socket.ServerWs(hub, w, r)
	})

	//other routes
	routes.AuthRoutes(mux)

	handler := middleware.CORS(mux)

	fmt.Println("Server is running on port 8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		panic(err)
	}
}
