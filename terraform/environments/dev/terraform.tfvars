# =============================================================================
# Dev Environment — terraform/environments/dev/terraform.tfvars
# =============================================================================
# Override defaults for the dev environment.
# NEVER put secrets (passwords, keys) in this file.
# =============================================================================

project_name         = "taskmanager"
environment          = "dev"
aws_region           = "eu-west-3"
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]
db_instance_class    = "db.t4g.micro"
db_allocated_storage = 20
ecs_cpu              = 256
ecs_memory           = 512
ecs_desired_count    = 1
github_repository    = "ranimturkirt-sketch/aws-project"
