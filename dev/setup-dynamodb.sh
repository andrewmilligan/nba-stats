#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "${DIR}/../.env"

aws dynamodb \
  create-table \
  --endpoint-url "$AWS_DYNAMODB_ENDPOINT" \
  --table-name "$AWS_DYNAMODB_TABLE_NAME" \
  --billing-mode "PAY_PER_REQUEST" \
  --attribute-definitions \
    AttributeName=PrimaryKey,AttributeType=S \
    AttributeName=SortKey,AttributeType=S \
  --key-schema \
    AttributeName=PrimaryKey,KeyType=HASH \
    AttributeName=SortKey,KeyType=RANGE
