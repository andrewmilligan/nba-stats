#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "${DIR}/../.env"

aws \
  --profile personal \
  dynamodb \
  create-table \
  --table-name "$AWS_DYNAMODB_TABLE_NAME" \
  --billing-mode "PAY_PER_REQUEST" \
  --attribute-definitions \
    AttributeName=PrimaryKey,AttributeType=S \
    AttributeName=SortKey,AttributeType=S \
  --key-schema \
    AttributeName=PrimaryKey,KeyType=HASH \
    AttributeName=SortKey,KeyType=RANGE
