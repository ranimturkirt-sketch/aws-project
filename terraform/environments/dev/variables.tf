# =============================================================================
# Dev Environment — terraform/environments/dev/variables.tf
# =============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "taskmanager"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "ecs_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "ECS task memory in MB"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "Number of ECS tasks"
  type        = number
  default     = 1
}

variable "container_image" {
  description = "Docker image for the backend (ECR URL:tag)"
  type        = string
  default     = "" # Set after first ECR push
}

variable "github_repository" {
  description = "GitHub repository (owner/repo)"
  type        = string
  default = "ranimturkirt-sketch/aws-project"

}

variable "aws_secret_key" {
  type = string
}

variable "aws_access_key" {
  type = string
}