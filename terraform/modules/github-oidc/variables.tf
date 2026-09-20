variable "project_name" { type = string }
variable "environment" { type = string }
variable "github_repository" {
  description = "GitHub repository in the format owner/repo"
  type        = string
  default = "ranimturkirt-sketch/aws-project"
}
