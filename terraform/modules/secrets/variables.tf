variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "db_master_secret_arn" {
  description = "ARN of the RDS master user secret in Secrets Manager"
  type        = string
  sensitive   = true
}
