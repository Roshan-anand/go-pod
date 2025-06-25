import { useWrtcContext } from "@/providers/context/wRTC/config";
import { useEffect } from "react";

const useRecordingService = () => {
  const { myScreen, myStream, isRecording } = useWrtcContext();

  const sendChunks = (chunks: Blob, type: "cam" | "screen") => {
    if (chunks.size === 0) return;

    fetch((import.meta.env.VITE_BACKEND_URL = "/chunks"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        chunks,
      }),
    });
  };

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
      if (event.data.size > 0) sendChunks(event.data, "cam");
    };

    recorder.onstop = () => {
      console.log("cam Recording stopped");
    };

    recorder.onstart = () => {
      console.log("cam Recording started");
    };
    recorder.start(20000);

    return () => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    };
  }, [isRecording, myStream]);

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
      if (event.data.size > 0) sendChunks(event.data, "screen");
    };

    recorder.onstop = () => {
      console.log("screen Recording stopped");
    };

    recorder.onstart = () => {
      console.log("screen Recording started");
    };
    recorder.start(20000);

    return () => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    };
  }, [isRecording, myScreen]);
};

export default useRecordingService;
