package socket

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/Roshan-anand/go-pod/internal/utils"
	"github.com/pion/webrtc/v4"
)

// configuration for webrtc
// contains the STUN server used for NAT traversal
// and the ICE candidate pool size
var config = webrtc.Configuration{
	ICEServers: []webrtc.ICEServer{
		{
			URLs: []string{"stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"},
		},
	},
	ICECandidatePoolSize: 10,
}

// to handle sdp offer
func (c *Client) offer(d *WsData[string]) {
	rErrData := &RwsEv{
		Event: "error:rtc",
		Data:  make(WsData[any]),
	}

	//decompress the sdp data
	sdp, err := utils.DecompressD((*d)["sdp"])
	if err != nil {
		fmt.Println("error while decompressing sdp:", err)
		c.WsEmit(rErrData)
		return
	}

	// making a new peer connection
	peerC, err := webrtc.NewPeerConnection(config)
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

	// handeling incomming tracks
	peerC.OnTrack(func(t *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
		fmt.Println("tracks from ", t.ID())
		tracks, err := webrtc.NewTrackLocalStaticRTP(t.Codec().RTPCodecCapability, c.email, t.StreamID())
		if err != nil {
			fmt.Println("error while creating local track:", err)
			return
		}

		// sendding tracks to the studio tracks channel
		// this invokes the c.addTracks() goroutine
		// c.studio.tracks <- tracks

		rtpBuf := make([]byte, 1400)
		for {
			i, _, readErr := t.Read(rtpBuf)
			if readErr != nil {
				panic(readErr)
			}

			// ErrClosedPipe means we don't have any subscribers, this is ok if no peers have connected yet
			if _, err = tracks.Write(rtpBuf[:i]); err != nil && !errors.Is(err, io.ErrClosedPipe) {
				panic(err)
			}
		}
	})

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
