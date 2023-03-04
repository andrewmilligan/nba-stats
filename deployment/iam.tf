resource "aws_iam_role" "basketball_stats_lambda" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "basketball_stats_lambda" {
  policy_arn = "${aws_iam_policy.basketball_stats_lambda.arn}"
  role = "${aws_iam_role.basketball_stats_lambda.name}"
}

resource "aws_iam_policy" "basketball_stats_lambda" {
  policy = "${data.aws_iam_policy_document.basketball_stats_lambda.json}"
}

data "aws_iam_policy_document" "basketball_stats_lambda" {
  statement {
    sid       = "AllowSQSPermissions"
    effect    = "Allow"
    resources = ["${aws_sqs_queue.basketball_stats_queue.arn}"]

    actions = [
      "sqs:ChangeMessageVisibility",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ReceiveMessage",
      "sqs:SendMessage",
      "sqs:SendMessageBatch",
    ]
  }

  statement {
    sid       = "AllowS3Permissions"
    effect    = "Allow"
    resources = [
      "arn:aws:s3:::basketball-stats-data",
      "arn:aws:s3:::basketball-stats-data/*",
    ]

    actions = [
      "s3:ListBucket",
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
  }

  statement {
    sid       = "AllowDynamoDBPermissions"
    effect    = "Allow"
    resources = [
      "arn:aws:dynamodb:us-east-1:909150888982:table/BASKETBALL_STATS",
    ]

    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:BatchWriteItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem"
    ]
  }

  statement {
    sid       = "AllowInvokingLambdas"
    effect    = "Allow"
    resources = [
      "${aws_lambda_function.schedule_lambda.arn}",
      "${aws_lambda_function.task_lambda.arn}",
    ]
    actions   = ["lambda:InvokeFunction"]
  }

  statement {
    sid       = "AllowCreatingLogGroups"
    effect    = "Allow"
    resources = ["arn:aws:logs:us-east-1:*:*"]
    actions   = ["logs:CreateLogGroup"]
  }
  statement {
    sid       = "AllowWritingLogs"
    effect    = "Allow"
    resources = ["arn:aws:logs:us-east-1:*:log-group:/aws/lambda/*:*"]

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
  }
}
