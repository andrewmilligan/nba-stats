import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from './ddbDocClient.js';
import ddbParams from './params.js';

const updateDocument = async function updateDocument(key, opts = {}) {
  const params = {
    TableName: ddbParams.table,
    Key: key,
    ReturnValues: 'ALL_NEW',
    ...opts,
  };
  const data = await ddbDocClient.send(new UpdateCommand(params));
  return data;
};

export default updateDocument;
