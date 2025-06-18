import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useWsContext } from "@/providers/context/socket/config";
import { useWrtcContext } from "@/providers/context/wRTC/config";
import type { WsData } from "@/lib/Type";
import { compressSdp, decompressSdp } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { setRoomId } from "@/providers/redux/slice/room";

//wRTC server configuration
const rtcConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

//handles all the wRTC emit and listen event's
const useWrtcService = () => {
  const dispatch = useDispatch();
  const { socket, WsEmit, WsOn, WsOff, listeners } = useWsContext();
  const { myStream } = useWrtcContext();
  const { peerC, setPeerC } = useWrtcContext();

  const bufferedIce = useRef<RTCIceCandidateInit[]>([]);

  //to initialize wRTC connection offer to the joined client
  const initOffer = async () => {
    if (!socket) return;
    const peer = new RTCPeerConnection(rtcConfig);

    //to send ICE candiate infomation to the connected peer
    peer.onicecandidate = (e) => {
      const candidate = e.candidate;
      if (!candidate) return;

      WsEmit({
        event: "ice",
        data: {
          ice: JSON.stringify(candidate),
        },
      });
    };

    //to track media streams of the connected peer
    //   peer.ontrack = (e) => {
    //     const stream = e.streams[0];
    //     setRemoteStreams((prev) => {
    //       prev.set(email, stream);
    //       return new Map(prev);
    //     });
    //   };

    //to send user's media stream to the connected peer
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        WsEmit({
          event: "proposal",
          data: {
            id: track.id,
            kind: "camera",
          },
        });
        peer.addTrack(track, myStream);
      });
    }

    //to handle peer disconnection
    peer.onconnectionstatechange = () => {
      const state = peer.connectionState;
      if (state !== "disconnected") return;

      peer.close();
      setPeerC(null);
      // setRemoteStreams((prev) => {
      //   prev.delete(email);
      //   return new Map(prev);
      // });
      toast.error(` disconnected from the room`);
    };

    //create offer and send it to the server
    const sdp = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(sdp));
    setPeerC(peer);
    const zipSdp = compressSdp(sdp.sdp as string); //compressed to reduce bandwidth usage
    WsEmit({
      event: "sdp:offer",
      data: {
        sdp: zipSdp,
      },
    });
  };

  //to listen for wRTC events
  useEffect(() => {
    if (!socket) return;
    if (listeners.has("sdp:answer")) return;
    console.log("setup");

    WsOn("sdp:answer", async ({ sdp }: WsData) => {
      if (!peerC) return;

      const sdpS = decompressSdp(sdp as string);
      await peerC.setRemoteDescription(
        new RTCSessionDescription({
          type: "answer",
          sdp: sdpS,
        })
      );

      //adding buffered ICE to the peer
      bufferedIce.current.forEach((candidate) =>
        peerC.addIceCandidate(new RTCIceCandidate(candidate))
      );
    });

    WsOn("ice", ({ ice }: WsData) => {
      const candidate = ice as RTCIceCandidateInit;
      if (!peerC) return;

      //buffering until remote description is set
      if (peerC.remoteDescription && peerC.remoteDescription.type === "answer")
        peerC.addIceCandidate(new RTCIceCandidate(candidate));
      else bufferedIce.current.push(candidate);
    });

    WsOn("error:rtc", () => {
      toast.error("error occured in server");
      dispatch(setRoomId(null));
    });

    return () => {
      WsOff("sdp:answer");
      WsOff("ice");
      console.log("clean up");
    };
  }, [socket, peerC, WsOn, WsOff, listeners, dispatch]);

  return { initOffer };
};

export default useWrtcService;
