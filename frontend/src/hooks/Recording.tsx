import { useWrtcContext } from "@/providers/context/wRTC/config";
import { useEffect } from "react";
import usePodStore from "./podstore";
import { useSelector } from "react-redux";
import type { StateT } from "@/providers/redux/store";

const useRecordingService = () => {
  const { myScreen, myStream } = useWrtcContext();
  const { isRecording } = useSelector((state: StateT) => state.room);

  const { uploadFile, startMultiPartUpload } = usePodStore();

  //to start recording users cam
  useEffect(() => {
    if (!isRecording || !myStream) return;

    const audio = myStream.audio.getAudioTracks();
    const video = myStream.video.getVideoTracks();
    const stream = new MediaStream([...audio, ...video]);

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    // on data available
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) uploadFile(event.data, "cam");
    };

    recorder.onstop = () => {
      console.log("cam Recording stopped");
    };

    recorder.onstart = () => {
      console.log("cam Recording started");
      startMultiPartUpload("cam");
    };
    recorder.start();

    return () => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    };
  }, [isRecording, myStream, uploadFile, startMultiPartUpload]);

  //to start recording users screen
  useEffect(() => {
    if (!isRecording || !myScreen) return;

    const audio = myScreen.audio.getAudioTracks();
    const video = myScreen.video.getVideoTracks();
    const stream = new MediaStream([...audio, ...video]);

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    // on data available
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) uploadFile(event.data, "screen");
    };

    recorder.onstop = () => {
      console.log("screen Recording stopped");
    };

    recorder.onstart = () => {
      console.log("screen Recording started");
      startMultiPartUpload("screen");
    };
    recorder.start();

    return () => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    };
  }, [isRecording, myScreen, uploadFile, startMultiPartUpload]);
};

export default useRecordingService;
