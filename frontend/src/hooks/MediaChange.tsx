import { useWrtcContext } from "@/providers/context/wRTC/config";
import { useCallback, useEffect } from "react";
import { useWsContext } from "@/providers/context/socket/config";
import { compressSdp } from "@/lib/utils";

const useMediaChange = () => {
  const { myScreen, RtcState, peerC } = useWrtcContext();
  const { WsEmit } = useWsContext();

  //to initialize wRTC connection offer to the joined client
  const negotiate = useCallback(async () => {
    if (!peerC) return;

    //create offer and send it to the server
    const sdp = await peerC.createOffer();
    await peerC.setLocalDescription(new RTCSessionDescription(sdp));
    const zipSdp = compressSdp(sdp.sdp as string); //compressed to reduce bandwidth usage
    WsEmit({
      event: "sdp:offer",
      data: {
        type: "negotiate",
        sdp: zipSdp,
      },
    });
  }, [WsEmit, peerC]);

  //onscreen share
  useEffect(() => {
    if (RtcState !== "negotiate") return;
    if (!peerC || !myScreen) return;

    const send = (t: MediaStreamTrack, stream: MediaStream) => {
      if (!peerC) return;
      WsEmit({
        event: "proposal",
        data: {
          id: t.id,
          kind: "screen",
        },
      });
      peerC.addTrack(t, stream);
    };
    myScreen.audio.getTracks().forEach((track) => {
      send(track, myScreen.audio);
    });
    myScreen.video.getTracks().forEach((track) => {
      send(track, myScreen.video);
    });
    negotiate();
  }, [myScreen, RtcState, WsEmit, peerC, negotiate]);
};

export default useMediaChange;
