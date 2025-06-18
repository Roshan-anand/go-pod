package socket

import (
	"fmt"
	"sync"
)

type Hub struct {
	client     map[*Client]bool
	register   chan *Client
	unregister chan *Client
	studios    map[string]*studio
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		client:     make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		studios:    make(map[string]*studio),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case c := <-h.register:
			h.mu.Lock()
			h.client[c] = true
			fmt.Println("client connected", c.conn.RemoteAddr())
			h.mu.Unlock()
		case c := <-h.unregister:
			h.mu.Lock()
			delete(h.client, c)
			c.conn.Close()
			fmt.Println("client disconnected", c.conn.RemoteAddr())
			h.mu.Unlock()
		}
	}
}
