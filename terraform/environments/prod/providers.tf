provider "aws" {
  region = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

terraform {
  backend "s3" {
    bucket         = "taskmanager-terraform-state-eu-west-3"
    key            = "dev/terraform.tfstate"
    region         = "eu-west-3"
    dynamodb_table = "taskmanager-terraform-lock"
    encrypt        = true
  }
}
