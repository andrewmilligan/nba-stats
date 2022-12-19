data "archive_file" "task_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/dist/task.js"
  output_path = "${path.module}/dist/task.zip"
}

data "archive_file" "schedule_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/dist/scheduleTasks.js"
  output_path = "${path.module}/dist/scheduleTasks.zip"
}

resource "aws_lambda_function" "task_lambda" {
  function_name = "basketball_stats_task_lambda"
  handler = "task.task"
  role = "${aws_iam_role.basketball_stats_lambda.arn}"
  runtime = "nodejs16.x"

  filename = "${data.archive_file.task_lambda_zip.output_path}"
  source_code_hash = "${data.archive_file.task_lambda_zip.output_base64sha256}"

  timeout = 30
  memory_size = 128

  environment {
    variables = {
      AWS_CLOUDFRONT_DISTRIBUTION = "E33WH3YYF53YOA"
      AWS_S3_BUCKET = "basketball-stats-data"
    }
  }
}

resource "aws_lambda_function" "schedule_lambda" {
  function_name = "basketball_stats_schedule_lambda"
  handler = "scheduleTasks.scheduleTasks"
  role = "${aws_iam_role.basketball_stats_lambda.arn}"
  runtime = "nodejs16.x"

  filename = "${data.archive_file.schedule_lambda_zip.output_path}"
  source_code_hash = "${data.archive_file.schedule_lambda_zip.output_base64sha256}"

  timeout = 30
  memory_size = 128

  environment {
    variables = {
      AWS_SQS_URL = "${aws_sqs_queue.basketball_stats_queue.id}"
      AWS_SQS_BATCH_SIZE = "10"
      SCHEDULE_RATE_MINUTES = "10"
      SCHEDULE_INTERVAL_SECONDS = "15"
      AWS_CLOUDFRONT_DISTRIBUTION = "E33WH3YYF53YOA"
      AWS_S3_BUCKET = "basketball-stats-data"
    }
  }
}
