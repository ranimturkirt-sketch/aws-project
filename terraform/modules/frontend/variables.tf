variable "project_name" { type = string }
variable "environment" { type = string }
variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for custom domain (us-east-1). Leave empty for CloudFront default."
  type        = string
  default     = ""
}
variable "domain_names" {
  description = "Custom domain names for CloudFront (requires ACM cert)"
  type        = list(string)
  default     = []
}
