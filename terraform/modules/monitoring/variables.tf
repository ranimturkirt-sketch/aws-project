variable "project_name" { type = string }
variable "environment" { type = string }
variable "log_retention_days" {
  type    = number
  default = 30
}
variable "enable_alarms" {
  type    = bool
  default = false
}
variable "alb_arn_suffix" {
  type    = string
  default = ""
}
variable "ecs_cluster_name" {
  type    = string
  default = ""
}
variable "ecs_service_name" {
  type    = string
  default = ""
}
