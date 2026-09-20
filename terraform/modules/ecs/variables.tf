variable "project_name" { type = string }
variable "environment" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "ecs_security_group_id" { type = string }
variable "target_group_arn" { type = string }
variable "alb_listener_arn" {
  description = "ARN of the ALB listener (used for depends_on)"
  type        = string
}
variable "container_image" {
  description = "Full Docker image URI (ECR URL:tag)"
  type        = string
}
variable "db_secret_arn" {
  description = "ARN of the Secrets Manager secret for DB credentials"
  type        = string
  sensitive   = true
}
variable "log_group_name" {
  description = "CloudWatch log group name"
  type        = string
}
variable "app_port" {
  type    = number
  default = 3000
}
variable "cpu" {
  description = "CPU units for the task (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 256
}
variable "memory" {
  description = "Memory in MB for the task"
  type        = number
  default     = 512
}
variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}
variable "cors_origin" {
  description = "CORS origin for the backend"
  type        = string
  default     = "*"
}
variable "enable_autoscaling" {
  type    = bool
  default = false
}
variable "max_count" {
  type    = number
  default = 4
}
