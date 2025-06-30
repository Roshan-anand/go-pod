import { S3Client } from '@aws-sdk/client-s3';

const accessKey = import.meta.env.VITE_S3_ACCESS_KEY;
const secretAccessKey = import.meta.env.VITE_S3_SECRET_ACCESS_KEY;

export const podStore = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
});
