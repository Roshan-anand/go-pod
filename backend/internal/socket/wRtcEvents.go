package socket

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"

	"github.com/Roshan-anand/go-pod/internal/config"
	"github.com/Roshan-anand/go-pod/internal/utils"
	"github.com/pion/webrtc/v4"
)

type ConnType string

const (
	Initial   ConnType = "initial"
	Negotiate ConnType = "negotiate"
)

// to initialize a new offer
func (c *Client) initOffer() {
	sdp, err := c.peerC.CreateOffer(nil)
	if err != nil {
		fmt.Println("error while creating offer:", err)
		return
	}
	err = c.peerC.SetLocalDescription(sdp)
	if err != nil {
		fmt.Println("error while setting local description:", err)
		return
	}
	sdpStr, err := utils.CompressD(&sdp.SDP)
	if err != nil {
		fmt.Println("error while compressing sdp:", err)
		return
	}
	c.WsEmit(&RwsEv{
		Event: "sdp:offer",
		Data: WsData[any]{
			"sdp": sdpStr,
		},
	})
}

// to handle sdp offer
func (c *Client) offer(d *WsData[string]) {
	connT := (*d)["type"]
	compSdp := (*d)["sdp"]
	rErrData := &RwsEv{
		Event: "error:rtc",
		Data:  make(WsData[any]),
	}

	//decompress the sdp data
	sdp, err := utils.DecompressD(compSdp)
	if err != nil {
		log.Fatal("error while decompressing sdp:", err)
		c.WsEmit(rErrData)
		return
	}

	var peerC *webrtc.PeerConnection

	if connT == string(Initial) {
		// making a new peer connection
		peerC, err = webrtc.NewPeerConnection(config.WrtcConfig)
		if err != nil {
			c.WsEmit(rErrData)
			return
		}
		c.peerC = peerC

		//handle connection state
		peerC.OnConnectionStateChange(func(s webrtc.PeerConnectionState) {
			if s == webrtc.PeerConnectionStateClosed || s == webrtc.PeerConnectionStateFailed {
				fmt.Println("peer connection closed or failed")
			}
		})

		// on ICE candidate gathering
		peerC.OnICECandidate(func(i *webrtc.ICECandidate) {
			if i == nil {
				fmt.Println("ICE candidate gathering complete")
				return
			}

			ice := i.ToJSON()
			c.WsEmit(&RwsEv{
				Event: "ice",
				Data: WsData[any]{
					"ice": ice,
				},
			})
		})

		// handling incoming tracks
		peerC.OnTrack(func(t *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
			id := c.email + "-" + t.ID()
			lTrack, err := webrtc.NewTrackLocalStaticRTP(t.Codec().RTPCodecCapability, t.ID(), id)
			if err != nil {
				fmt.Println("error while creating local track:", err)
				return
			}

			// sending tracks to the studio tracks channel
			// for organizing and distributing tracks
			c.studio.sendTrack <- lTrack

			rtpBuf := make([]byte, 1400)
			for {
				i, _, readErr := t.Read(rtpBuf)
				if readErr != nil {
					fmt.Println("error while reading track:", readErr)
					break
				}

				// ErrClosedPipe means we don't have any subscribers, this is ok if no peers have connected yet
				if _, err = lTrack.Write(rtpBuf[:i]); err != nil && !errors.Is(err, io.ErrClosedPipe) {
					fmt.Println("error while writing track:", err)
					break
				}
			}
		})

		// sending other clients tracks
		for _, prop := range c.studio.tracks {
			c.WsEmit(&RwsEv{
				Event: "proposal",
				Data: WsData[any]{
					"id":    prop.id,
					"email": prop.email,
					"kind":  prop.kind,
				},
			})
			peerC.AddTrack(prop.track)
		}
	} else {
		peerC = c.peerC
	}

	//setting up remote description
	err = peerC.SetRemoteDescription(webrtc.SessionDescription{
		Type: webrtc.SDPTypeOffer,
		SDP:  sdp,
	})
	if err != nil {
		fmt.Println("error while setting remote description:", err)
		c.WsEmit(rErrData)
		return
	}

	//creating an answer
	ans, err := peerC.CreateAnswer(nil)
	if err != nil {
		fmt.Println("error while creating answer:", err)
		c.WsEmit(rErrData)
		return
	}
	err = peerC.SetLocalDescription(ans) //set the local description
	if err != nil {
		fmt.Println("error while setting local description:", err)
		c.WsEmit(rErrData)
		return
	}

	//compress the answer sdp
	sdp, err = utils.CompressD(&ans.SDP)
	if err != nil {
		fmt.Println("error while compressing sdp:", err)
		c.WsEmit(rErrData)
		return
	}

	c.WsEmit(&RwsEv{
		Event: "sdp:answer",
		Data: WsData[any]{
			"sdp": sdp,
		},
	})
}

// to handle SDP answer
func (c *Client) answer(d *WsData[string]) {
	sdp := (*d)["sdp"]

	sdpStr, err := utils.DecompressD(sdp)
	if err != nil {
		fmt.Println("error while decompressing sdp:", err)
		return
	}
	c.peerC.SetRemoteDescription(webrtc.SessionDescription{
		Type: webrtc.SDPTypeAnswer,
		SDP:  sdpStr,
	})
}

// to handle ICE candidates
func (c *Client) ice(d *WsData[string]) {
	c.hub.mu.Lock()
	defer c.hub.mu.Unlock()

	ice := (*d)["ice"]
	var candid webrtc.ICECandidateInit
	err := json.Unmarshal([]byte(ice), &candid)
	if err != nil {
		fmt.Println("error while unmarshalling ICE candidate:", err)
	}

	err = c.peerC.AddICECandidate(candid)
	if err != nil {
		fmt.Println("error while adding ICE candidate:", err)
	}
}

// to handle proposal
func (c *Client) proposal(d *WsData[string]) {
	id := (*d)["id"]
	kind := (*d)["kind"]

	prop := &proposal{
		id:    id,
		email: c.email,
		kind:  kind,
	}
	c.studio.sendProp <- prop
}
