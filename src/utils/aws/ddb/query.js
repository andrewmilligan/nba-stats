import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from './ddbDocClient.js';
import ddbParams from './params.js';

const query = async function query(opts = {}) {
  const params = {
    TableName: ddbParams.table,
    ...opts,
  };
  const data = await ddbDocClient.send(new QueryCommand(params));
  return data;
};

export default query;
