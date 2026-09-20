# Terraform — Infrastructure AWS

Infrastructure complète pour le projet Task Manager DevSecOps.

## Structure

```
terraform/
├── bootstrap/       # Remote state (S3 + DynamoDB)
├── modules/         # 10 modules réutilisables
│   ├── network/     # VPC, Subnets, IGW, NAT, Routes
│   ├── security/    # Security Groups
│   ├── ecr/         # Container Registry
│   ├── rds/         # PostgreSQL
│   ├── secrets/     # Secrets Manager
│   ├── alb/         # Load Balancer
│   ├── ecs/         # ECS Fargate
│   ├── frontend/    # S3 + CloudFront
│   ├── monitoring/  # CloudWatch
│   └── github-oidc/ # OIDC + IAM
└── environments/
    ├── dev/         # Développement
    ├── preprod/     # Pré-production
    └── prod/        # Production
```

## Bootstrap

```bash
cd bootstrap
terraform init
terraform apply
```

## Usage

```bash
cd environments/dev
terraform init
terraform plan
terraform apply
```

## Modules

Chaque module contient :
- `main.tf` — Ressources
- `variables.tf` — Variables d'entrée
- `outputs.tf` — Valeurs de sortie
