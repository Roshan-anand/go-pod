import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useWsContext } from "@/providers/context/socket/config";
import { useWrtcContext } from "@/providers/context/wRTC/config";
import type { Proposal, RemoteStreamT, RtcConnT, WsData } from "@/lib/Type";
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
  const { myStream, setRemoteStreams, setRemoteScreens } = useWrtcContext();
  const { peerC, setPeerC } = useWrtcContext();

  const bufferedIce = useRef<RTCIceCandidateInit[]>([]);
  const bufferedProp = useRef<Map<string, Proposal>>(new Map());

  const SetTracks = useCallback(
    ({ email, kind, track }: Proposal) => {
      if (!email || !track) return;

      const add = (prev: RemoteStreamT) => {
        const newR = new Map(prev);

        if (!newR.has(email))
          newR.set(email, {
            audio: new MediaStream(),
            video: new MediaStream(),
          });

        const client = newR.get(email);
        if (client) {
          if (track.kind === "audio") client.audio.addTrack(track);
          else client.video.addTrack(track);
        }
        return newR;
      };

      if (kind === "camera") setRemoteStreams((prev) => add(prev));
      else setRemoteScreens((prev) => add(prev));
    },
    [setRemoteStreams, setRemoteScreens]
  );

  //to initialize wRTC connection offer to the joined client
  const initOffer = useCallback(
    async (type: RtcConnT) => {
      if (!socket) return;
      let peer: RTCPeerConnection | null = null;

      // if the connection is intial then setup new wRTC and its related event listeners
      if (type === "initial") {
        peer = new RTCPeerConnection(rtcConfig);

        //to send ICE candidate information to the connected peer
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
        peer.ontrack = (e) => {
          const stream = e.streams[0];
          const id = stream.id;
          const proposal = bufferedProp.current.get(id);
          if (proposal) {
            proposal.track = e.track;
            SetTracks(proposal);
            bufferedProp.current.delete(id);
          } else {
            bufferedProp.current.set(id, {
              id,
              email: null,
              kind: null,
              track: e.track,
            });
          }
        };

        //to send user's media stream to the connected peer
        if (myStream) {
          const send = (t: MediaStreamTrack) => {
            if (!peer) return;
            WsEmit({
              event: "proposal",
              data: {
                id: t.id,
                kind: "camera",
              },
            });
            peer.addTrack(t, myStream.audio);
          };
          myStream.audio.getTracks().forEach((track) => {
            send(track);
          });
          myStream.video.getTracks().forEach((track) => {
            send(track);
          });
        }

        //to handle peer disconnection
        peer.onconnectionstatechange = () => {
          if (!peer) return;
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
      } else peer = peerC;

      if (!peer) return;
      console.log("wRTC connection : ", type);

      //create offer and send it to the server
      const sdp = await peer.createOffer();
      await peer.setLocalDescription(new RTCSessionDescription(sdp));
      setPeerC(peer);
      const zipSdp = compressSdp(sdp.sdp as string); //compressed to reduce bandwidth usage
      WsEmit({
        event: "sdp:offer",
        data: {
          type: type,
          sdp: zipSdp,
        },
      });
    },
    [SetTracks, WsEmit, myStream, peerC, setPeerC, socket]
  );

  // to set offer and initialize answer
  const initAns = useCallback(
    async (sdp: string) => {
      if (!peerC) return;
      const sdpS = decompressSdp(sdp);
      await peerC.setRemoteDescription(
        new RTCSessionDescription({
          type: "offer",
          sdp: sdpS,
        })
      );

      const ans = await peerC.createAnswer();
      await peerC.setLocalDescription(new RTCSessionDescription(ans));
      const zipSdp = compressSdp(ans.sdp as string);
      WsEmit({
        event: "sdp:answer",
        data: {
          sdp: zipSdp,
        },
      });
    },
    [WsEmit, peerC]
  );

  //to listen for wRTC events
  useEffect(() => {
    if (!socket) return;
    if (listeners.has("sdp:answer")) return;

    WsOn("sdp:offer", async ({ sdp }: WsData) => {
      initAns(sdp as string);
    });

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

    WsOn("proposal", ({ id, kind, email }: WsData) => {
      id = id as string;
      kind = kind as string;
      email = email as string;
      const proposal = bufferedProp.current.get(id);
      if (proposal) {
        proposal.kind = kind;
        proposal.email = email;
        SetTracks(proposal);
        bufferedProp.current.delete(id);
      } else {
        bufferedProp.current.set(id, { id, kind, email, track: null });
      }
    });

    return () => {
      WsOff("sdp:answer");
      WsOff("ice");
    };
  }, [socket, peerC, WsOn, WsOff, listeners, dispatch, SetTracks, initAns]);

  return { initOffer };
};

export default useWrtcService;
