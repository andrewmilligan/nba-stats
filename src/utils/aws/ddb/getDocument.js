import { GetCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from './ddbDocClient.js';
import ddbParams from './params.js';

const getDocument = async function getDocument(doc) {
  const params = {
    TableName: ddbParams.table,
    Key: doc,
  };
  const data = await ddbDocClient.send(new GetCommand(params));
  return data.Item;
};

export default getDocument;
