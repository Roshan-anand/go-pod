import * as medaisoup from "mediasoup";
import { RtpCodecCapability } from "mediasoup/node/lib/rtpParametersTypes";

const mediaCodecs: RtpCodecCapability[] = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
  },
];

const initMediasoup = async () => {
  try {
    const worker = await medaisoup.createWorker({
      logLevel: "error",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
    });

    const router = await worker.createRouter({
      mediaCodecs,
    });

    const transport = await router.createWebRtcTransport({
      listenInfos: [
        {
          protocol: "udp",
          ip: "0.0.0.0",
          announcedIp: "YOUR.PUBLIC.IP", 
          portRange: {
            min: 20000,
            max: 30000,
          },
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 1000000,
    });
  } catch (err) {
    console.error("Error initializing mediasoup:", err);
    throw err;
  }
};

export default initMediasoup;
