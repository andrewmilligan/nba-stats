const {
  AWS_DYNAMODB_TABLE_NAME,
} = process.env;

export default {
  table: AWS_DYNAMODB_TABLE_NAME,
};
