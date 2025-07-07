import type { CompletedPart } from "@aws-sdk/client-s3";

type WsVal =
  | string
  | boolean
  | RTCIceServer
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
  name: string;
};
export type RemoteStreamT = Map<string, StreamT>;

export type Proposal = {
  id: string;
  email: string | null;
  name: string | null;
  kind: string | null;
  track: MediaStreamTrack | null;
};

export type RtcConnT = "initial" | "negotiate";

export type RecordingDevice = "cam" | "screen";
export type RecordingData = Record<
  RecordingDevice,
  {
    recorder: MediaRecorder | null;
    uploadingData: { Key: string; uploadID: string } | null;
    uploadChunks: CompletedPart[];
  }
>;

export type RecordsData = {
  url: string;
  createdAt: string;
  name: string;
  device: string;
};
