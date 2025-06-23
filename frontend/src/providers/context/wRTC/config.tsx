import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { RemoteStreamT, RtcConnT, StreamT } from "../../../lib/Type";

type contextT = {
  peerC: RTCPeerConnection | null;
  setPeerC: Dispatch<SetStateAction<RTCPeerConnection | null>>;
  myStream: StreamT | null;
  setMyStream: Dispatch<SetStateAction<StreamT | null>>;
  myScreen: StreamT | null;
  setMyScreen: Dispatch<SetStateAction<StreamT | null>>;
  remoteStreams: RemoteStreamT;
  setRemoteStreams: Dispatch<SetStateAction<RemoteStreamT>>;
  remoteScreens: RemoteStreamT;
  setRemoteScreens: Dispatch<SetStateAction<RemoteStreamT>>;
  audioOpt: MediaDeviceInfo[];
  setAudioOpt: Dispatch<SetStateAction<MediaDeviceInfo[]>>;
  videoOpt: MediaDeviceInfo[];
  setVideoOpt: Dispatch<SetStateAction<MediaDeviceInfo[]>>;
  RtcState: RtcConnT;
  setRtcState: Dispatch<SetStateAction<RtcConnT>>;
};

export const WrtcContext = createContext<contextT | null>(null);

export const useWrtcContext = () => {
  const context = useContext(WrtcContext);
  if (!context) {
    throw new Error("inter error");
  }
  return context;
};
