import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import stream, { Readable } from 'stream';
import util from 'util';
import { PassThrough } from "stream";

const s3Client = new S3Client({ region: "ap-northeast-1" });
const getStream = util.promisify(stream.pipeline);

async function getFileBuffer(props: { bucketName: string, objectKey: string }) {
  const middle = new PassThrough();

  const { bucketName, objectKey: key } = props;
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  const response = await s3Client.send(command);
  const bytes = await response.Body?.transformToByteArray();
  if (!bytes) {
    return null;
  } else {
   return Buffer.from(bytes);
  }
}

export default {
  getFileBuffer
}