import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { RemoteStreamT } from "../../../lib/Type";

type contextT = {
  peerC: RTCPeerConnection | null;
  setPeerC: Dispatch<SetStateAction<RTCPeerConnection | null>>;
  myStream: MediaStream | null;
  setMyStream: Dispatch<SetStateAction<MediaStream | null>>;
  remoteStreams: RemoteStreamT;
  setRemoteStreams: Dispatch<SetStateAction<RemoteStreamT>>;
  audioOpt: MediaDeviceInfo[];
  setAudioOpt: Dispatch<SetStateAction<MediaDeviceInfo[]>>;
  videoOpt: MediaDeviceInfo[];
  setVideoOpt: Dispatch<SetStateAction<MediaDeviceInfo[]>>;
  myScreen: MediaStream | null;
  setMyScreen: Dispatch<SetStateAction<MediaStream | null>>;
};

export const WrtcContext = createContext<contextT | null>(null);

export const useWrtcContext = () => {
  const context = useContext(WrtcContext);
  if (!context) {
    throw new Error("inter error");
  }
  return context;
};
