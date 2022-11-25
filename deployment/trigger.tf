resource "aws_lambda_event_source_mapping" "queue_source_mapping" {
  batch_size        = 1
  event_source_arn  = "${aws_sqs_queue.basketball_stats_queue.arn}"
  enabled           = true
  function_name     = "${aws_lambda_function.task_lambda.arn}"
}

resource "aws_cloudwatch_event_rule" "schedule_rate" {
  name                = "schedule-rate"
  description         = "Fires every ten minutes"
  schedule_expression = "rate(10 minutes)"
}

resource "aws_cloudwatch_event_target" "run_schedule" {
  rule      = "${aws_cloudwatch_event_rule.schedule_rate.name}"
  target_id = "lambda"
  arn       = "${aws_lambda_function.schedule_lambda.arn}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_schedule" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.schedule_lambda.function_name}"
  principal     = "events.amazonaws.com"
  source_arn    = "${aws_cloudwatch_event_rule.schedule_rate.arn}"
}
