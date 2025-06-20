type WsVal =
  | string
  | number
  | RTCSessionDescriptionInit
  | RTCIceCandidate
  | null;

export type WsData = Record<string, WsVal>;

export type wsEvent = {
  event: string;
  data: WsData;
};

export type StreamT = {
  audio: MediaStream;
  video: MediaStream;
};
export type RemoteStreamT = Map<string, StreamT>;

export type Proposal = {
  id: string;
  email: string | null;
  kind: string | null;
  track: MediaStreamTrack | null;
};
