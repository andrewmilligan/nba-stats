import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import log from '../log';
import getCacheControl from '../cache/cacheControl';
import purge from './purge';

const {
  AWS_S3_BUCKET,
  AWS_S3_PREFIX,
  AWS_REGION = 'us-east-1',
} = process.env;

const upload = async function upload(opts = {}) {
  const {
    key,
    content,
    cacheControl = getCacheControl(10),
    contentType = 'application/json',
    purge: clearCache = false,
  } = opts;

  const client = new S3Client({ region: AWS_REGION });
  const fullKey = AWS_S3_PREFIX ? `${AWS_S3_PREFIX}/${key}` : key;
  const config = {
    Bucket: AWS_S3_BUCKET,
    Key: fullKey,
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
