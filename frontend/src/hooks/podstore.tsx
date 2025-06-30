import { podStore } from "@/config/s3client";
import { setRecordingKey } from "@/providers/redux/slice/room";
import type { StateT } from "@/providers/redux/store";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

//hook related to all S3 operations
//upload folder structure: host/recording-name/useremail-type.webm
const usePodStore = () => {
  const dispatch = useDispatch();
  const { host, recordingName } = useSelector((state: StateT) => state.room);
  const { email } = useSelector((state: StateT) => state.user);

  const Bucket = import.meta.env.VITE_S3_BUCKET_NAME as string;

  // to start a mumtipart upload to S3
  // for uploading small chunks of data
  // to avoid timeout and large file size issues
  const startMultiPartUpload = useCallback(
    async (type: string) => {
      if (!host || !recordingName || !email) return;

      const Key = `${host}/${recordingName}/${email}-${type}.webm`;
      const cmd = new CreateMultipartUploadCommand({
        Bucket,
        Key,
      });
      dispatch(setRecordingKey({ type, Key }));
      await podStore.send(cmd);
      console.log("Started multipart upload for:", Key);
    },
    [dispatch, host, recordingName, email, Bucket]
  );

  // to upload the chunks to the started multipart upload
  const uploadFile = useCallback(async (file: Blob, type: string) => {
    console.log("Uploading file to S3:", file, type);
  }, []);

  return {
    startMultiPartUpload,
    uploadFile,
  };
};

export default usePodStore;
