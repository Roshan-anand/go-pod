package socket

import (
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
			h.mu.Unlock()
		case c := <-h.unregister:
			h.mu.Lock()
			delete(h.client, c)
			if c.email != "" {
				delete(c.studio.clients, c.email)
			}
			c.conn.Close()
			h.mu.Unlock()
		}
	}
}
