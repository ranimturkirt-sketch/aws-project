output "oidc_provider_arn" {
  value = aws_iam_openid_connect_provider.github.arn
}

output "terraform_role_arn" {
  description = "ARN of the IAM role for Terraform workflows"
  value       = aws_iam_role.github_terraform.arn
}

output "deploy_role_arn" {
  description = "ARN of the IAM role for deploy workflows"
  value       = aws_iam_role.github_deploy.arn
}
