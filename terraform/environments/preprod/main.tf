# =============================================================================
# Dev Environment — terraform/environments/dev/main.tf
# =============================================================================
# Root module that composes all infrastructure modules for the dev environment.
# =============================================================================

locals {
  # Use a placeholder image for initial deployment before first CI push
  container_image = var.container_image != "" ? var.container_image : "${module.ecr.repository_url}:initial"
}

# ── Network ──────────────────────────────────────────────────────────────────
module "network" {
  source = "../../modules/network"

  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  enable_nat_gateway   = true
  single_nat_gateway   = true # Cost saving: single NAT GW in dev
}

# ── Security Groups ─────────────────────────────────────────────────────────
module "security" {
  source = "../../modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.network.vpc_id
  app_port     = 3000
}

# ── ECR ──────────────────────────────────────────────────────────────────────
module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# ── Monitoring (create log group before ECS) ─────────────────────────────────
module "monitoring" {
  source = "../../modules/monitoring"

  project_name       = var.project_name
  environment        = var.environment
  log_retention_days = 14
  enable_alarms      = false
}

# ── RDS ──────────────────────────────────────────────────────────────────────
module "rds" {
  source = "../../modules/rds"

  project_name          = var.project_name
  environment           = var.environment
  private_subnet_ids    = module.network.private_subnet_ids
  rds_security_group_id = module.security.rds_security_group_id
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  multi_az              = false
  backup_retention_period = 1
  deletion_protection   = false
  skip_final_snapshot   = true
}

# ── Secrets (reference the RDS-managed secret) ──────────────────────────────
module "secrets" {
  source = "../../modules/secrets"

  project_name         = var.project_name
  environment          = var.environment
  db_master_secret_arn = module.rds.db_master_secret_arn
}

# ── ALB ──────────────────────────────────────────────────────────────────────
module "alb" {
  source = "../../modules/alb"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.network.vpc_id
  public_subnet_ids     = module.network.public_subnet_ids
  alb_security_group_id = module.security.alb_security_group_id
  app_port              = 3000
}

# ── ECS ──────────────────────────────────────────────────────────────────────
module "ecs" {
  source = "../../modules/ecs"

  project_name          = var.project_name
  environment           = var.environment
  private_subnet_ids    = module.network.private_subnet_ids
  ecs_security_group_id = module.security.ecs_security_group_id
  target_group_arn      = module.alb.target_group_arn
  alb_listener_arn      = module.alb.alb_dns_name  # dependency
  container_image       = local.container_image
  db_secret_arn         = module.rds.db_master_secret_arn
  log_group_name        = module.monitoring.log_group_name
  cpu                   = var.ecs_cpu
  memory                = var.ecs_memory
  desired_count         = var.ecs_desired_count
  cors_origin           = "*"
  enable_autoscaling    = false
}

# ── Frontend (S3 + CloudFront) ───────────────────────────────────────────────
module "frontend" {
  source = "../../modules/frontend"

  project_name = var.project_name
  environment  = var.environment
}

# ── GitHub OIDC ──────────────────────────────────────────────────────────────
module "github_oidc" {
  source = "../../modules/github-oidc"

  project_name      = var.project_name
  environment       = var.environment
  github_repository = var.github_repository
}
