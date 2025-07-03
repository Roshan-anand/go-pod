package utils

import (
	"log"
	"os"

	"github.com/pion/webrtc/v4"
	"github.com/twilio/twilio-go"
	api "github.com/twilio/twilio-go/rest/api/v2010"
)

// to generate a new ICE configuration
// this function uses Twilio's API to get the ICE servers and credentials
func GetICEconfig() webrtc.ICEServer {

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: os.Getenv("TWILIO_ACCOUNT_SID"),
		Password: os.Getenv("TWILIO_AUTH_TOKEN"),
	})
	time := 360000
	params := &api.CreateTokenParams{
		Ttl: &time,
	}
	token, err := client.Api.CreateToken(params)
	if err != nil {
		log.Fatal("Failed to create token:", err)
		return webrtc.ICEServer{}
	}

	var TwloIceS webrtc.ICEServer

	TwloIceS.Credential = token.Password
	TwloIceS.Username = *token.Username
	TwloIceS.URLs = make([]string, 0)

	for _, srv := range *token.IceServers {
		TwloIceS.URLs = append(TwloIceS.URLs, srv.Url)
	}

	return TwloIceS
}
