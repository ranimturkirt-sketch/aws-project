variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "alb_security_group_id" {
  type = string
}

variable "app_port" {
  type    = number
  default = 3000
}

variable "certificate_arn" {
  description = "ARN of ACM certificate for HTTPS. Leave empty to use HTTP only."
  type        = string
  default     = ""
}
