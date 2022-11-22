import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';

const {
  AWS_CLOUDFRONT_DISTRIBUTION,
  AWS_REGION = 'us-east-1',
} = process.env;

const purge = async function purge(opts = {}) {
  const {
    paths = [],
  } = opts;

  if (paths.length < 1) {
    return undefined;
  }

  const client = new CloudFrontClient({ region: AWS_REGION });
  const command = new CreateInvalidationCommand({
    DistributionId: AWS_CLOUDFRONT_DISTRIBUTION,
    InvalidationBatch: {
      Paths: paths,
    },
  });
  const rsp = await client.send(command);
  return rsp;
};

export default purge;
