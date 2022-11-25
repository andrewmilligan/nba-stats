import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';
import log from '../log';

const {
  AWS_SQS_URL,
  AWS_SQS_BATCH_SIZE = '10',
  AWS_REGION = 'us-east-1',
} = process.env;

const queueMessages = async function queueMessages(opts = {}) {
  const {
    batchId = uuidv4(),
    batchSize = Number(AWS_SQS_BATCH_SIZE),
    messages = [],
  } = opts;

  const sqs = new SQSClient({ region: AWS_REGION });
  const entries = messages.map((message, i) => {
    const {
      id = i.toString().padStart(4, '0'),
      delay,
      body,
    } = message;
    return {
      Id: `${batchId}--${id}`,
      DelaySeconds: delay,
      MessageBody: JSON.stringify(body),
    };
  });

  const numBatches = Math.ceil(entries.length / batchSize);
  await [...Array(numBatches)].reduce(async (promise, _, i) => {
    await promise;

    const start = i * batchSize;
    const end = start + batchSize;
    const input = {
      Entries: entries.slice(start, end),
      QueueUrl: AWS_SQS_URL,
    };
    log(`Dispatching a batch of ${input.Entries.length} messages to SQS at ${input.QueueUrl}`);
    log(JSON.stringify(input, null, 2));
    const command = new SendMessageBatchCommand(input);

    const rsp = await sqs.send(command);
    log(rsp);
  }, Promise.resolve());
};

export default queueMessages;
