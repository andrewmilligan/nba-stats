import { PutCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from './ddbDocClient.js';
import ddbParams from './params.js';

const putDocument = async function putDocument(doc) {
  const params = {
    TableName: ddbParams.table,
    Item: doc,
  };
  const data = await ddbDocClient.send(new PutCommand(params));
  return data;
};

export default putDocument;
