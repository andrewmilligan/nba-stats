import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import purge from './purge';

const {
  AWS_S3_BUCKET,
  AWS_REGION = 'us-east-1',
} = process.env;

const upload = async function upload(opts = {}) {
  const {
    key,
    content,
    cacheControl = 'max-age=5',
    contentType = 'application/json',
    purge: clearCache = false,
  } = opts;

  const client = new S3Client({ region: AWS_REGION });
  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    CacheControl: cacheControl,
    ContentType: contentType,
    Body: content,
  });
  const rsp = await client.send(command);

  if (clearCache) {
    await purge({ paths: [key] });
  }

  return rsp;
};

export default upload;
