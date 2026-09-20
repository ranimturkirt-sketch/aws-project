# =============================================================================
# Prod Environment — terraform.tfvars
# =============================================================================

project_name         = "taskmanager"
environment          = "prod"
aws_region           = "eu-west-3"
vpc_cidr             = "10.2.0.0/16"
public_subnet_cidrs  = ["10.2.1.0/24", "10.2.2.0/24"]
private_subnet_cidrs = ["10.2.10.0/24", "10.2.20.0/24"]
db_instance_class    = "db.t4g.medium"
db_allocated_storage = 50
ecs_cpu              = 512
ecs_memory           = 1024
ecs_desired_count    = 2
github_repository = "rannim/projet-aws"
