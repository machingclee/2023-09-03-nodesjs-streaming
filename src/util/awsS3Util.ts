import AWS from "aws-sdk";

const S3 = new AWS.S3();

async function getFileStream(props: { bucketName: string, objectKey: string }) {
  const { bucketName, objectKey } = props;
  return S3.getObject({ Bucket: bucketName, Key: objectKey }).createReadStream();
}

export default {
  getFileStream
}