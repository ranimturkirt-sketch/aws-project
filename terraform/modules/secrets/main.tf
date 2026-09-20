# =============================================================================
# Secrets Module — terraform/modules/secrets/main.tf
# =============================================================================
# Retrieves the RDS-managed secret from Secrets Manager.
# The secret is automatically created by RDS when using
# manage_master_user_password = true.
# =============================================================================

# ── Retrieve the RDS-managed secret ──────────────────────────────────────────
data "aws_secretsmanager_secret" "rds" {
  arn = var.db_master_secret_arn
}

data "aws_secretsmanager_secret_version" "rds" {
  secret_id = data.aws_secretsmanager_secret.rds.id
}
