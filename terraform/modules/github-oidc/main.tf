# =============================================================================
# GitHub OIDC Module — terraform/modules/github-oidc/main.tf
# =============================================================================
# OIDC provider + IAM roles for GitHub Actions authentication to AWS.
# No permanent AWS access keys are used.
# =============================================================================

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ── OIDC Provider ─────────────────────────────────────────────────────────────
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  # GitHub's OIDC thumbprint
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  tags = {
    Name        = "github-oidc-provider"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ── Terraform Role ────────────────────────────────────────────────────────────
# Used by the terraform.yml workflow to manage infrastructure.
resource "aws_iam_role" "github_terraform" {
  name = "${var.project_name}-github-terraform-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repository}:ref:refs/heads/main"
        }
      }
    }]
  })

  max_session_duration = 3600

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Purpose     = "GitHub Actions Terraform"
  }
}

# Terraform role policy — scoped to required services
# NOTE: In a production environment, you should further restrict this policy.
# This policy is intentionally broader for the demo but documented as such.
resource "aws_iam_role_policy" "github_terraform" {
  name = "${var.project_name}-terraform-policy"
  role = aws_iam_role.github_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "VPCNetworking"
        Effect = "Allow"
        Action = [
          "ec2:*Vpc*", "ec2:*Subnet*", "ec2:*Gateway*", "ec2:*Route*",
          "ec2:*SecurityGroup*", "ec2:*Address*", "ec2:*NetworkInterface*",
          "ec2:*Tags*", "ec2:Describe*", "ec2:*NatGateway*",
          "ec2:AllocateAddress", "ec2:ReleaseAddress",
          "ec2:CreateTags", "ec2:DeleteTags",
        ]
        Resource = "*"
      },
      {
        Sid    = "ECSFull"
        Effect = "Allow"
        Action = ["ecs:*", "ecr:*"]
        Resource = "*"
      },
      {
        Sid    = "RDS"
        Effect = "Allow"
        Action = ["rds:*"]
        Resource = "*"
      },
      {
        Sid    = "S3"
        Effect = "Allow"
        Action = ["s3:*"]
        Resource = "*"
      },
      {
        Sid    = "CloudFront"
        Effect = "Allow"
        Action = ["cloudfront:*"]
        Resource = "*"
      },
      {
        Sid    = "IAM"
        Effect = "Allow"
        Action = [
          "iam:CreateRole", "iam:DeleteRole", "iam:GetRole", "iam:PassRole",
          "iam:AttachRolePolicy", "iam:DetachRolePolicy",
          "iam:PutRolePolicy", "iam:DeleteRolePolicy", "iam:GetRolePolicy",
          "iam:ListRolePolicies", "iam:ListAttachedRolePolicies",
          "iam:TagRole", "iam:UntagRole", "iam:ListInstanceProfilesForRole",
          "iam:CreateOpenIDConnectProvider", "iam:DeleteOpenIDConnectProvider",
          "iam:GetOpenIDConnectProvider", "iam:TagOpenIDConnectProvider",
          "iam:ListOpenIDConnectProviders",
          "iam:CreatePolicy", "iam:DeletePolicy", "iam:GetPolicy",
          "iam:GetPolicyVersion", "iam:ListPolicyVersions",
          "iam:CreatePolicyVersion", "iam:DeletePolicyVersion",
        ]
        Resource = "*"
      },
      {
        Sid    = "SecretsManager"
        Effect = "Allow"
        Action = ["secretsmanager:*"]
        Resource = "*"
      },
      {
        Sid    = "CloudWatch"
        Effect = "Allow"
        Action = ["logs:*", "cloudwatch:*", "application-autoscaling:*"]
        Resource = "*"
      },
      {
        Sid    = "TerraformState"
        Effect = "Allow"
        Action = [
          "s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket",
          "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem",
        ]
        Resource = [
          "arn:aws:s3:::${var.project_name}-terraform-state-*",
          "arn:aws:s3:::${var.project_name}-terraform-state-*/*",
          "arn:aws:dynamodb:*:${data.aws_caller_identity.current.account_id}:table/${var.project_name}-terraform-lock*",
        ]
      },
      {
        Sid    = "ElasticLoadBalancing"
        Effect = "Allow"
        Action = ["elasticloadbalancing:*"]
        Resource = "*"
      }
    ]
  })
}

# ── Deploy Role ───────────────────────────────────────────────────────────────
# Used by backend-ci-cd.yml and frontend-ci-cd.yml for deployments.
# Scoped to ECR, ECS, S3 frontend, and CloudFront only.
resource "aws_iam_role" "github_deploy" {
  name = "${var.project_name}-github-deploy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repository}:ref:refs/heads/main"
        }
      }
    }]
  })

  max_session_duration = 3600

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Purpose     = "GitHub Actions Deploy"
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name = "${var.project_name}-deploy-policy"
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECR"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:DescribeRepositories",
          "ecr:DescribeImages",
        ]
        Resource = "*"
      },
      {
        Sid    = "ECS"
        Effect = "Allow"
        Action = [
          "ecs:DescribeServices",
          "ecs:UpdateService",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:DeregisterTaskDefinition",
          "ecs:DescribeClusters",
          "ecs:ListTasks",
          "ecs:DescribeTasks",
        ]
        Resource = "*"
      },
      {
        Sid    = "PassRole"
        Effect = "Allow"
        Action = ["iam:PassRole"]
        Resource = [
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-*-ecs-*"
        ]
      },
      {
        Sid    = "S3Frontend"
        Effect = "Allow"
        Action = [
          "s3:PutObject", "s3:GetObject", "s3:DeleteObject",
          "s3:ListBucket", "s3:GetBucketLocation",
        ]
        Resource = [
          "arn:aws:s3:::${var.project_name}-*-frontend-*",
          "arn:aws:s3:::${var.project_name}-*-frontend-*/*",
        ]
      },
      {
        Sid    = "CloudFrontInvalidation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations",
        ]
        Resource = "*"
      }
    ]
  })
}
