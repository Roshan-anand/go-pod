package socket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type WsData[T string | any] map[string]T
type RwsEv struct {
	Event string      `json:"event"`
	Data  WsData[any] `json:"data"`
}
type WsEv struct {
	Event string         `json:"event"`
	Data  WsData[string] `json:"data"`
}

// represents a client
type Client struct {
	hub    *Hub
	studio *studio
	conn   *websocket.Conn
	send   chan []byte
	name   string
	email  string
	peerC  *webrtc.PeerConnection
}

// it reads the incomming msg from the client
func (c *Client) readPump() {

	//this function will run after any error caused while reading the msg
	//to tell hub that the client is unregistered
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		// read the incomming msg
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error while reading message: %v", err)
			}
			break
		}

		//unmarshal the msg
		var evMsg WsEv
		err = json.Unmarshal(msg, &evMsg)
		if err != nil {
			log.Printf("error while unmarshalling message: %v", err)
			continue
		}

		switch evMsg.Event {
		case "create:room":
			c.createRoom(&evMsg.Data)
		case "join:room":
			c.joinRoom(&evMsg.Data)
		case "check:room":
			c.checkRoom(&evMsg.Data)
		case "sdp:offer":
			c.offer(&evMsg.Data)
		case "sdp:answer":
			c.answer(&evMsg.Data)
		case "ice":
			c.ice(&evMsg.Data)
		case "proposal":
			c.proposal(&evMsg.Data)
		default:
			fmt.Println("other event received:", evMsg.Event)
		}

	}
}

// it writes the msg back to the given client
func (c *Client) writePump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	for {
		msg, ok := <-c.send
		if !ok {
			c.conn.WriteMessage(websocket.CloseMessage, []byte{})
			fmt.Println("channel closed, stopping writePump")
			return
		}

		w, err := c.conn.NextWriter(websocket.TextMessage)
		if err != nil {
			log.Printf("error while getting next writer: %v", err)
			return
		}
		w.Write(msg)

		if err = w.Close(); err != nil {
			log.Printf("error while closing writer: %v", err)
			return
		}
	}
}

// to emit to the given client
func (c *Client) WsEmit(ev *RwsEv) {
	data, err := json.Marshal(ev)
	if err != nil {
		log.Fatal("error while marshalling data:", err)
		return
	}
	c.send <- data
}

// to upgrade the HTTP to Websocket connection
//
// upgrader given by gorilla/websocket package
// used to set upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	EnableCompression: true,
}

//warning chage the origin as needed

// main http handler that upgrades the connection
func ServerWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}
