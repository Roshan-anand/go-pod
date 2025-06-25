import type React from "react";
import { useState } from "react";
import { WrtcContext } from "./config";
import type { RemoteStreamT, RtcConnT, StreamT } from "../../../lib/Type";

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [peerC, setPeerC] = useState<RTCPeerConnection | null>(null);
  const [myStream, setMyStream] = useState<StreamT | null>(null);
  const [myScreen, setMyScreen] = useState<StreamT | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamT>(new Map());
  const [remoteScreens, setRemoteScreens] = useState<RemoteStreamT>(new Map());
  const [audioOpt, setAudioOpt] = useState<MediaDeviceInfo[]>([]);
  const [videoOpt, setVideoOpt] = useState<MediaDeviceInfo[]>([]);
  const [RtcState, setRtcState] = useState<RtcConnT>("initial");
  const [isRecording, setIsRecording] = useState<boolean>(false);

  return (
    <WrtcContext.Provider
      value={{
        peerC,
        setPeerC,
        myStream,
        setMyStream,
        remoteStreams,
        setRemoteStreams,
        audioOpt,
        setAudioOpt,
        videoOpt,
        setVideoOpt,
        myScreen,
        setMyScreen,
        remoteScreens,
        setRemoteScreens,
        RtcState,
        setRtcState,
        isRecording,
        setIsRecording,
      }}
    >
      {children}
    </WrtcContext.Provider>
  );
};

export default ContextProvider;
