import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import ddbClient from './ddbClient';

const marshallOptions = {};

const unmarshallOptions = {};

const translateConfig = {
  marshallOptions,
  unmarshallOptions,
};

export default DynamoDBDocumentClient.from(ddbClient, translateConfig);
