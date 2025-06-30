package socket

import (
	"fmt"
	"time"

	"github.com/pion/webrtc/v4"
)

type proposal struct {
	id    string
	email string
	kind  string
	track *webrtc.TrackLocalStaticRTP
}

type studio struct {
	name          string
	host          string
	recordingName string
	clients       map[string]*Client
	tracks        map[string]*proposal
	sendTrack     chan *webrtc.TrackLocalStaticRTP
	sendProp      chan *proposal
}

// it sets a unique reference for each proposal
func (s *studio) studioTracksDistribute(prop *proposal) {
	// now distribute to all clients in the studio
	for _, c := range s.clients {
		if c.email != prop.email {
			c.WsEmit(&RwsEv{
				Event: "proposal",
				Data: WsData[any]{
					"id":    prop.id,
					"email": prop.email,
					"kind":  prop.kind,
				},
			})
			c.peerC.AddTrack(prop.track)

			if c.flushTimer != nil {
				c.flushTimer.Stop()
			}
			c.flushTimer = time.AfterFunc(500*time.Millisecond, func() {
				c.initOffer()
			})
		}
	}

	id := fmt.Sprintf("%s-%s-%s", prop.email, prop.kind, prop.track.Kind().String())
	s.tracks[id] = prop
}

// to organize incoming tracks and proposals
func (s *studio) studioTracksOrganize() {

	tracks := make(map[string]*proposal)

	// setting up of new proposal for tracks
	// if tracks exists, update to it's respective track
	go func() {
		for {
			prop := <-s.sendProp
			id := prop.email + "-" + prop.id
			if t, ok := tracks[id]; ok {
				t.email = prop.email
				t.kind = prop.kind
				t.track = prop.track
				s.studioTracksDistribute(t)
				delete(tracks, id)
			} else {
				tracks[id] = prop
			}
		}
	}()

	// updating the proposal with it's respective track
	go func() {
		for {
			track := <-s.sendTrack
			id := track.StreamID()
			if t, ok := tracks[id]; ok {
				t.id = id
				t.track = track
				s.studioTracksDistribute(t)
				delete(tracks, id)
			} else {
				tracks[id] = &proposal{
					id:    id,
					track: track,
				}
			}
		}
	}()

}
