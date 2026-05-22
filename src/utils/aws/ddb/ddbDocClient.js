import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import ddbClient from './ddbClient.js';

const marshallOptions = {};

const unmarshallOptions = {};

const translateConfig = {
  marshallOptions,
  unmarshallOptions,
};

export default DynamoDBDocumentClient.from(ddbClient, translateConfig);
