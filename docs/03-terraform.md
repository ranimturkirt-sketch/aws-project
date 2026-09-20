# Chapitre 3 — Terraform

## Objectif
Gérer toute l'infrastructure AWS comme du code versionnable et reproductible.

## Pourquoi Terraform ?
- **Reproductibilité** : Détruire et recréer l'infrastructure identique en quelques minutes
- **Versioning** : Historique complet des changements dans Git
- **Collaboration** : Revue de code pour les changements d'infrastructure
- **Multi-environnement** : Même code, variables différentes (dev/preprod/prod)

## Structure

```
terraform/
├── bootstrap/           # Remote state (S3 + DynamoDB)
├── modules/             # 10 modules réutilisables
│   ├── network/         # VPC, subnets, IGW, NAT
│   ├── security/        # Security Groups
│   ├── ecr/             # Container Registry
│   ├── rds/             # PostgreSQL
│   ├── secrets/         # Secrets Manager
│   ├── alb/             # Load Balancer
│   ├── ecs/             # ECS Fargate
│   ├── frontend/        # S3 + CloudFront
│   ├── monitoring/      # CloudWatch
│   └── github-oidc/     # OIDC Provider + IAM
└── environments/
    ├── dev/             # Environnement développement
    ├── preprod/         # Pré-production
    └── prod/            # Production
```

## Bootstrap — Remote State

Avant d'utiliser Terraform, il faut créer le bucket S3 pour stocker l'état :

```bash
cd terraform/bootstrap
terraform init
terraform apply
```

Cela crée :
- **S3 Bucket** : Stocke `terraform.tfstate` (versioning activé, chiffrement AES256)
- **DynamoDB Table** : Verrouillage pour empêcher les modifications concurrentes

## Commandes essentielles

```bash
terraform init      # Initialiser les providers et le backend
terraform fmt       # Formater le code HCL
terraform validate  # Valider la syntaxe
terraform plan      # Prévisualiser les changements
terraform apply     # Appliquer les changements
terraform destroy   # Détruire l'infrastructure
terraform output    # Afficher les sorties
```

## Bonnes pratiques

1. **Toujours `plan` avant `apply`**
2. **Ne jamais modifier l'état manuellement**
3. **Utiliser des variables pour tout ce qui change entre environnements**
4. **Ajouter `description` à chaque variable**
5. **Marquer `sensitive = true` les outputs contenant des secrets**
6. **Utiliser `terraform fmt` avant chaque commit**

## Vérification

```bash
terraform fmt -check -recursive terraform/
terraform validate
terraform plan -no-color
```

---

[← Network](02-network.md) | [RDS →](04-rds.md)
