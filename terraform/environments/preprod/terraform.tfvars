# =============================================================================
# Preprod Environment — terraform.tfvars
# =============================================================================

project_name         = "taskmanager"
environment          = "preprod"
aws_region           = "eu-west-3"
vpc_cidr             = "10.1.0.0/16"
public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24"]
private_subnet_cidrs = ["10.1.10.0/24", "10.1.20.0/24"]
db_instance_class    = "db.t4g.small"
db_allocated_storage = 20
ecs_cpu              = 512
ecs_memory           = 1024
ecs_desired_count    = 1
github_repository = "rannim/projet-aws"

