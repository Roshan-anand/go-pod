import { useWrtcContext } from "@/providers/context/wRTC/config";
import usePodStore from "./podstore";
import type { RecordingDevice, StreamT, WsData } from "@/lib/Type";
import { useDispatch, useSelector } from "react-redux";
import { setIsRecording } from "@/providers/redux/slice/room";
import { useCallback, useEffect, useRef } from "react";
import type { StateT } from "@/providers/redux/store";
import { toast } from "react-toastify";
import { useWsContext } from "@/providers/context/socket/config";

const useRecordingService = () => {
  const dispatch = useDispatch();
  const { socket, WsOn, WsOff, listeners } = useWsContext();
  const { recordingData, myScreen, myStream } = useWrtcContext();
  const { isRecording, recordingName, role } = useSelector(
    (state: StateT) => state.room
  );
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

  const startRecording = useCallback(
    (stream: StreamT, type: RecordingDevice) => {
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

        toast.info("recoridng stop");
      };

      recorder.onstart = () => {
        toast.info("Recording started");
        dispatch(setIsRecording(true));
        startMultiPartUpload(type);
      };
      recorder.start(10000);
    },
    [
      FinishMultipartUpload,
      dispatch,
      startMultiPartUpload,
      uploadFile,
      recordingData,
    ]
  );

  const stopRecording = useCallback(
    (type: RecordingDevice) => {
      recordingData.current[type].recorder?.stop();
      recordingData.current[type].recorder = null;
    },
    [recordingData]
  );

  const recordAction = useCallback(() => {
    if (!recordingName) {
      toast.error("Please set a valid recording name");
      return;
    }

    if (isRecording) {
      stopRecording("cam");
      stopRecording("screen");
      dispatch(setIsRecording(false));
      return;
    }

    if (myStream) startRecording(myStream, "cam");
    if (myScreen) startRecording(myScreen, "screen");
  }, [
    dispatch,
    isRecording,
    myScreen,
    myStream,
    recordingName,
    startRecording,
    stopRecording,
  ]);

  useEffect(() => {
    if (!socket) return;
    if (role !== "guest") return;
    if (listeners.has("record:receive")) return;
    console.log("event created");
    WsOn("record:receive", (data: WsData) => {
      console.log(data.action);
      const action = data.action as boolean;
      if (action === isRecording) return;
      recordAction();
    });

    return () => {
      console.log("event removed");
      WsOff("record:receive");
    };
  }, [socket, WsOn, WsOff, listeners, recordAction, isRecording, role]);

  return {
    startRecording,
    stopRecording,
    recordAction,
  };
};

export default useRecordingService;
