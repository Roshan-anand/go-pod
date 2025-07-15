import { Button } from "../ui/button";
import { useState } from "react";
import { useWrtcContext } from "@/providers/context/wRTC/config";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "../ui/select";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { FaRecordVinyl } from "react-icons/fa";
import { BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { LuScreenShare } from "react-icons/lu";
import type { StreamT, wsEvent } from "@/lib/Type";
import { useSelector } from "react-redux";
import type { StateT } from "@/providers/redux/store";
import useRecordingService from "@/hooks/Recording";
import { useWsContext } from "@/providers/context/socket/config";

//to show available audio and video devices and allow user to select them
const SetupMedia = ({ stream }: { stream: StreamT }) => {
  const { audioOpt, videoOpt, setMyStream } = useWrtcContext();

  //to set the new selected audio track
  const handleAudioChange = async (deviceId: string) => {
    stream.audio.getAudioTracks()[0].stop();
    stream.audio.getAudioTracks()[0].enabled = false;

    // Get new audio track
    const newAudioStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
    });

    const newAudioTrack = newAudioStream.getAudioTracks()[0];
    const currentVideoTrack = stream.video.getVideoTracks()[0];
    setMyStream({
      audio: new MediaStream([newAudioTrack]),
      video: new MediaStream([currentVideoTrack]),
      name: "you",
    });
  };

  //to set the new selected video track
  const handleVideoChange = async (deviceId: string) => {
    stream.video.getVideoTracks()[0].stop();
    stream.video.getVideoTracks()[0].enabled = false;

    // Get new video track
    const newVideoStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
    });
    const newVideoTrack = newVideoStream.getVideoTracks()[0];
    const currentAudioTrack = stream.audio.getAudioTracks()[0];
    setMyStream({
      audio: new MediaStream([currentAudioTrack]),
      video: new MediaStream([newVideoTrack]),
      name: "you",
    });
  };

  return (
    <figure className="flex flex-col py-2 gap-2 [&>*]:bg-bg-sec [&>*]:rounded-sm">
      {/* audio select */}
      <Select
        value={stream.audio.getAudioTracks()[0].getSettings().deviceId}
        onValueChange={handleAudioChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Microphone" />
        </SelectTrigger>
        <SelectContent className="bg-bg-sec">
          {audioOpt.map((d) => (
            <SelectItem value={d.deviceId} key={d.deviceId}>
              <FaMicrophone /> {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Video Select */}
      <Select
        value={stream.video.getVideoTracks()[0].getSettings().deviceId}
        onValueChange={handleVideoChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Camera" />
        </SelectTrigger>
        <SelectContent className="bg-bg-sec">
          {videoOpt.map((d) => (
            <SelectItem value={d.deviceId} key={d.deviceId}>
              <BsCameraVideoFill /> {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </figure>
  );
};

//to give control over mic to enable/disable it
const ControlerMic = ({
  stream,
  className,
}: {
  stream: MediaStream;
  className?: string;
}) => {
  const [isEnabled, setIsEnabled] = useState(
    stream.getAudioTracks()[0].enabled
  );
  return (
    <Button className={`flex items-center gap-2 ${className || ""}`}>
      <div
        onClick={() => {
          stream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
          });
          setIsEnabled(!isEnabled);
        }}
      >
        {isEnabled ? (
          <FaMicrophone className="icon-md mx-auto" />
        ) : (
          <FaMicrophoneSlash className="icon-md mx-auto" />
        )}
      </div>
    </Button>
  );
};

//to give control over camera to enable/disable it
const ControlerCamera = ({
  stream,
  className,
}: {
  stream: MediaStream;
  className?: string;
}) => {
  const [isEnabled, setIsEnabled] = useState(
    stream.getVideoTracks()[0].enabled
  );
  return (
    <Button className={`flex items-center gap-2 ${className || ""}`}>
      <div
        onClick={async () => {
          stream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
          });
          setIsEnabled(!isEnabled);
        }}
      >
        {isEnabled ? (
          <BsCameraVideoFill className="icon-md mx-auto" />
        ) : (
          <BsCameraVideoOffFill className="icon-md mx-auto" />
        )}
      </div>
    </Button>
  );
};

//to give control over speaker to enable/disable it
const ControlerSpeaker = ({ className }: { className?: string }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  return (
    <Button
      className={className}
      variant={"prime"}
      onClick={() => {
        setIsEnabled(!isEnabled);
      }}
    >
      {isEnabled ? (
        <HiSpeakerWave className="icon-md" />
      ) : (
        <HiSpeakerXMark className="icon-md mx-auto" />
      )}
    </Button>
  );
};

//to give control over screen share
const ControlerScreenShare = () => {
  const { setMyScreen, setRtcState } = useWrtcContext();
  const { startRecording, stopRecording } = useRecordingService();
  const { isRecording } = useSelector((state: StateT) => state.room);
  const handleScreenShare = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    const screen: StreamT = {
      video: new MediaStream([stream.getVideoTracks()[0]]),
      audio: new MediaStream(),
      name: "you",
    };

    if (stream.getAudioTracks()[0])
      screen.audio = new MediaStream([stream.getAudioTracks()[0]]);

    setMyScreen(screen);
    if (isRecording) startRecording(screen, "screen");
    stream.getVideoTracks()[0].addEventListener("ended", () => {
      setMyScreen(null);
      stopRecording("screen");
    });
    setRtcState("negotiate");
  };

  return (
    <Button variant={"prime"} onClick={handleScreenShare}>
      <LuScreenShare className="icon-md" />
    </Button>
  );
};

const ControlerRecord = () => {
  const { isRecording } = useSelector((state: StateT) => state.room);
  const { WsEmit } = useWsContext();
  const { recordAction } = useRecordingService();
  return (
    <>
      <Button
        variant={"destructive"}
        className="flex gap-1"
        onClick={() => {
          const payload: wsEvent = {
            event: "record:send",
            data: {},
          };
          recordAction();
          WsEmit(payload);
        }}
      >
        <FaRecordVinyl className="icon-sm" />
        {isRecording ? <p>stop</p> : <p>record</p>}
      </Button>
    </>
  );
};

export {
  ControlerMic,
  ControlerCamera,
  ControlerSpeaker,
  ControlerScreenShare,
  SetupMedia,
  ControlerRecord,
};
