import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from './ddbDocClient';
import ddbParams from './params';

const deleteDocument = async function deleteDocument(doc) {
  const params = {
    TableName: ddbParams.table,
    Key: doc,
  };
  const data = await ddbDocClient.send(new DeleteCommand(params));
  return data;
};

export default deleteDocument;
