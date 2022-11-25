import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import log from '../log';
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
  const config = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    CacheControl: cacheControl,
    ContentType: contentType,
    Body: content,
  };
  log(`Uploading object to s3://${config.Bucket}/${config.Key}`);
  const command = new PutObjectCommand(config);
  const rsp = await client.send(command);

  if (clearCache) {
    await purge({ paths: [key] });
  }

  return rsp;
};

export default upload;
