# =============================================================================
# Dev Environment — Outputs
# =============================================================================

output "vpc_id" {
  value = module.network.vpc_id
}

output "public_subnet_ids" {
  value = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.network.private_subnet_ids
}

output "alb_dns_name" {
  description = "DNS name of the ALB (use this to access the API)"
  value       = module.alb.alb_dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront domain (use this to access the frontend)"
  value       = module.frontend.cloudfront_domain_name
}

output "frontend_bucket_name" {
  value = module.frontend.bucket_name
}

output "cloudfront_distribution_id" {
  value = module.frontend.cloudfront_distribution_id
}

output "ecr_repository_url" {
  value = module.ecr.repository_url
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}

output "ecs_service_name" {
  value = module.ecs.service_name
}

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
}

output "secret_arn" {
  value     = module.rds.db_master_secret_arn
  sensitive = true
}

output "github_terraform_role_arn" {
  description = "ARN of the GitHub Terraform IAM role"
  value       = module.github_oidc.terraform_role_arn
}

output "github_deploy_role_arn" {
  description = "ARN of the GitHub Deploy IAM role"
  value       = module.github_oidc.deploy_role_arn
}
