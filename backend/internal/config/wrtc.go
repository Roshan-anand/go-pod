package config

import (
	"time"

	"github.com/Roshan-anand/go-pod/internal/utils"
	"github.com/pion/webrtc/v4"
)

// configuration for webrtc
// contains the STUN server used for NAT traversal
// and the ICE candidate pool size
var WrtcConfig = webrtc.Configuration{
	ICEServers: []webrtc.ICEServer{
		{
			URLs: []string{"stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"},
		},
	},
	ICECandidatePoolSize: 10,
}

func set() {
	ice := utils.GetICEconfig()

	WrtcConfig = webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			ice,
			// {
			// 	URLs: []string{"stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"},
			// },
		},
		ICETransportPolicy:   webrtc.ICETransportPolicyAll,
		ICECandidatePoolSize: 10,
		// SDPSemantics: webrtc.SDPSemanticsUnifiedPlan,
		// BundlePolicy: webrtc.BundlePolicyBalanced,
	}
}

func SetIceConfig() {
	ticker := time.NewTicker(9 * time.Hour)
	go func() {
		defer ticker.Stop()
		set()
		for range ticker.C {
			set()
		}
	}()
}
