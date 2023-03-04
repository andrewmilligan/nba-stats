import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const {
  AWS_REGION,
  AWS_DYNAMODB_ENDPOINT,
} = process.env;

const options = { region: AWS_REGION };

if (AWS_DYNAMODB_ENDPOINT) {
  options.endpoint = AWS_DYNAMODB_ENDPOINT;
}

export default new DynamoDBClient(options);
