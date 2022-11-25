provider "aws" {
  region = "us-east-1"
  profile = "personal"
}

terraform {
  backend "s3" {
    bucket = "milligan-backup-files"
    key    = "basketball-stats-terraform/terraform.tfstate"
    region = "us-east-1"
    profile = "personal"
  }
}
