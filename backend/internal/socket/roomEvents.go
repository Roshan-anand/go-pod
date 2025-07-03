package socket

import (
	"github.com/Roshan-anand/go-pod/internal/utils"
	"github.com/pion/webrtc/v4"
)

// to create a new room
func (c *Client) createRoom(d *WsData[string]) {
	name := (*d)["name"]
	email := (*d)["email"]
	studioID := (*d)["studioID"]
	recName := (*d)["recName"]

	c.name = name
	c.email = email

	//create a new studio
	id := utils.GenerateID(8)
	c.hub.mu.Lock()
	studio := &studio{
		name:          studioID,
		host:          email,
		recordingName: recName,
		clients:       make(map[string]*Client),
		tracks:        make(map[string]*proposal),
		sendTrack:     make(chan *webrtc.TrackLocalStaticRTP),
		sendProp:      make(chan *proposal),
	}
	studio.clients[email] = c
	c.hub.studios[id] = studio
	c.studio = studio
	c.hub.mu.Unlock()

	// spins up two workers to listen and organize incoming tracks and proposals
	c.studio.studioTracksOrganize()

	// to get a new ICE configuration
	iceInfo := utils.GetICEconfig()

	rData := &RwsEv{
		Event: "room:created",
		Data: map[string]any{
			"roomID":  id,
			"recName": recName,
			"iceInfo": iceInfo,
		},
	}

	c.WsEmit(rData)
}

// to join an existing room
func (c *Client) joinRoom(d *WsData[string]) {
	roomID := (*d)["roomID"]
	name := (*d)["name"]
	email := (*d)["email"]

	c.name = name
	c.email = email

	rData := &RwsEv{
		Data: make(WsData[any]),
	}

	c.hub.mu.Lock()
	studio, exists := c.hub.studios[roomID]
	if !exists {
		c.hub.mu.Unlock()
		rData.Event = "room:error"
		rData.Data["msg"] = "Room does not exist"
		c.WsEmit(rData)
		return
	}

	studio.clients[email] = c
	c.studio = studio
	c.hub.mu.Unlock()

	// to get a new ICE configuration
	iceInfo := utils.GetICEconfig()

	rData.Event = "room:joined"
	rData.Data["roomID"] = roomID
	rData.Data["host"] = studio.host
	rData.Data["recName"] = studio.recordingName
	rData.Data["iceInfo"] = iceInfo
	c.WsEmit(rData)
}

// to check the existence of a room
func (c *Client) checkRoom(d *WsData[string]) {
	roomID := (*d)["roomID"]
	studioID := (*d)["studioID"]

	rData := &RwsEv{
		Event: "room:checked",
		Data:  make(WsData[any]),
	}

	c.hub.mu.Lock()
	studio, exists := c.hub.studios[roomID]
	if !exists || studio.name != studioID {
		rData.Data["exist"] = false
		c.hub.mu.Unlock()
		c.WsEmit(rData)
		return
	}
	c.hub.mu.Unlock()

	rData.Data["exist"] = true
	c.WsEmit(rData)
}
