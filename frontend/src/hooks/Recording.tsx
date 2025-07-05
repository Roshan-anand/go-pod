import { useWrtcContext } from "@/providers/context/wRTC/config";
import usePodStore from "./podstore";
import type { RecordingDevice, StreamT } from "@/lib/Type";
import { useDispatch } from "react-redux";
import { setIsRecording } from "@/providers/redux/slice/room";
import { useRef } from "react";

const useRecordingService = () => {
  const dispatch = useDispatch();
  const { recordingData } = useWrtcContext();
  const { uploadFile, startMultiPartUpload, FinishMultipartUpload } =
    usePodStore();

  const bufferBlob = useRef<Record<RecordingDevice, Blob[]>>({
    cam: [],
    screen: [],
  });
  const bufferUpload = useRef<Record<RecordingDevice, Promise<void>[]>>({
    cam: [],
    screen: [],
  });

  const startRecording = (stream: StreamT, type: RecordingDevice) => {
    const audio = stream.audio.getAudioTracks();
    const video = stream.video.getVideoTracks();
    const newStream = new MediaStream([...audio, ...video]);

    const recorder = new MediaRecorder(newStream, {
      mimeType: "video/webm; codecs=vp9",
    });
    recordingData.current[type].recorder = recorder;

    // on data available
    recorder.ondataavailable = (event) => {
      const chunk = new Blob([...bufferBlob.current[type], event.data], {
        type: event.data.type,
      });
      bufferBlob.current[type] = [];

      if (chunk.size > 5000000)
        bufferUpload.current[type].push(uploadFile(chunk, type));
      else bufferBlob.current[type].push(chunk);
    };

    recorder.onstop = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (bufferBlob.current[type].length > 0) {
        const chunk = new Blob(bufferBlob.current[type], {
          type: bufferBlob.current[type][0].type,
        });
        bufferUpload.current[type].push(uploadFile(chunk, type));
        bufferBlob.current[type] = [];
      }

      await Promise.all(bufferUpload.current[type]);
      bufferUpload.current[type] = [];
      FinishMultipartUpload(type);
    };

    recorder.onstart = () => {
      dispatch(setIsRecording(true));
      startMultiPartUpload(type);
    };
    recorder.start(10000);
  };

  const stopRecording = (type: RecordingDevice) => {
    recordingData.current[type].recorder?.stop();
    recordingData.current[type].recorder = null;
  };

  return {
    startRecording,
    stopRecording,
  };
};

export default useRecordingService;
