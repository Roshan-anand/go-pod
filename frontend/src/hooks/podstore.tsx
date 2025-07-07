import { podStore } from "@/config/s3client";
import type { RecordingDevice } from "@/lib/Type";
import { useWrtcContext } from "@/providers/context/wRTC/config";
import { setIsRecording } from "@/providers/redux/slice/room";
import type { StateT } from "@/providers/redux/store";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

//hook related to all S3 operations
//upload folder structure: host/recording-name/useremail-type.webm
const usePodStore = () => {
  const dispatch = useDispatch();
  const { hostEmail, recordingName } = useSelector(
    (state: StateT) => state.room
  );
  const { email, name } = useSelector((state: StateT) => state.user);
  const { recordingData } = useWrtcContext();

  const Bucket = import.meta.env.VITE_S3_BUCKET_NAME as string;

  // to start a mumtipart upload to S3
  // for uploading small chunks of data
  // to avoid timeout and large file size issues
  const startMultiPartUpload = async (type: RecordingDevice) => {
    if (!hostEmail || !recordingName || !email) return;

    const Key = `${hostEmail}/${recordingName}/${email}-${name}-${type}.webm`;
    const cmd = new CreateMultipartUploadCommand({
      Bucket,
      Key,
      Expires: new Date(Date.now() + 10 * 60 * 60 * 1000),
      ContentType: "video/webm",
    });

    try {
      const res = await podStore.send(cmd);
      recordingData.current[type].uploadingData = {
        Key,
        uploadID: res.UploadId!,
      };
      recordingData.current[type].uploadChunks = [];
    } catch (error) {
      console.error("Error starting multipart upload:", error);
      dispatch(setIsRecording(false));
    }
  };

  // to upload the chunks to the started multipart upload
  const uploadFile = async (
    chunk: Blob,
    type: RecordingDevice
  ): Promise<void> => {
    const data = new Uint8Array(await chunk.arrayBuffer());
    const Key = recordingData.current[type].uploadingData?.Key;
    const UploadId = recordingData.current[type].uploadingData?.uploadID;
    const PartNumber = recordingData.current[type].uploadChunks.length + 1;

    if (!Key || !UploadId) {
      console.error("Missing key or upload ID", Key, UploadId);
      return;
    }
    const cmd = new UploadPartCommand({
      Bucket,
      Key,
      UploadId,
      PartNumber,
      Body: data,
    });

    try {
      const { ETag } = await podStore.send(cmd);
      recordingData.current[type].uploadChunks.push({
        PartNumber,
        ETag,
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const FinishMultipartUpload = async (type: RecordingDevice) => {
    const Key = recordingData.current[type].uploadingData?.Key;
    const UploadId = recordingData.current[type].uploadingData?.uploadID;
    const Parts = recordingData.current[type].uploadChunks.sort(
      (a, b) => a.PartNumber! - b.PartNumber!
    );

    if (!Key || !UploadId || Parts.length === 0) {
      console.error("Missing key, upload ID, or parts", Key, UploadId, Parts);
      return;
    }

    const cmd = new CompleteMultipartUploadCommand({
      Bucket,
      Key,
      UploadId,
      MultipartUpload: {
        Parts,
      },
    });

    try {
      await podStore.send(cmd);
      toast.success(type + " Recordings are succesfully uploaded");
      recordingData.current[type].uploadChunks = [];
      recordingData.current[type].uploadingData = null;
    } catch (error) {
      console.error("Error starting multipart upload:", error);
    }
  };

  return {
    startMultiPartUpload,
    uploadFile,
    FinishMultipartUpload,
  };
};

export default usePodStore;
