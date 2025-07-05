import type { CompletedPart } from "@aws-sdk/client-s3";

type WsVal =
  | string
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
};
export type RemoteStreamT = Map<string, StreamT>;

export type Proposal = {
  id: string;
  email: string | null;
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