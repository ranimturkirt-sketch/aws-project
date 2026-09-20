output "secret_arn" {
  description = "ARN of the database secret"
  value       = data.aws_secretsmanager_secret.rds.arn
  sensitive   = true
}

output "secret_name" {
  description = "Name of the database secret"
  value       = data.aws_secretsmanager_secret.rds.name
}
