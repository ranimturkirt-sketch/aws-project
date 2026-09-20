# 🚀 DevSecOps AWS — Task Manager

[![Security Scans](https://github.com/rannim/projet-aws/actions/workflows/security.yml/badge.svg)](https://github.com/rannim/projet-aws/actions/workflows/security.yml)
[![Terraform](https://github.com/rannim/projet-aws/actions/workflows/terraform.yml/badge.svg)](https://github.com/rannim/projet-aws/actions/workflows/terraform.yml)
[![Backend CI/CD](https://github.com/rannim/projet-aws/actions/workflows/backend-ci-cd.yml/badge.svg)](https://github.com/rannim/projet-aws/actions/workflows/backend-ci-cd.yml)
[![Frontend CI/CD](https://github.com/rannim/projet-aws/actions/workflows/frontend-ci-cd.yml/badge.svg)](https://github.com/rannim/projet-aws/actions/workflows/frontend-ci-cd.yml)


Projet complet **DevSecOps** sur AWS, conçu comme support de formation professionnelle. Déploiement automatisé d'une application **Task Manager** (CRUD) avec infrastructure as code, pipelines CI/CD sécurisées, et documentation pédagogique complète.

---

## 📋 Table des matières

- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Quick Start](#-quick-start)
- [Prérequis](#-prérequis)
- [Infrastructure](#-infrastructure)
- [CI/CD](#-cicd)
- [Sécurité](#-sécurité)
- [Documentation](#-documentation)
- [Coûts AWS](#-coûts-aws)
- [Destruction du LAB](#-destruction-du-lab)

---

## 🏗 Architecture

```
Internet → CloudFront → S3 (Frontend React SPA)
Internet → ALB → ECS Fargate (Backend API) → RDS PostgreSQL
                        ↓
                  Secrets Manager
```

```
GitHub → GitHub Actions → OIDC → AWS IAM → Terraform / ECR / ECS / S3 / CloudFront
```

### Diagramme détaillé

Voir [diagrams/architecture.md](diagrams/architecture.md) pour les diagrammes Mermaid complets.

### Composants

| Composant | Service AWS | Description |
|---|---|---|
| Frontend | S3 + CloudFront | SPA React/Vite/TypeScript via CDN |
| Backend | ECS Fargate + ALB | API REST Node.js/Express/TypeScript |
| Base de données | RDS PostgreSQL | Base relationnelle dans subnets privés |
| Registry | ECR | Images Docker immutables |
| Secrets | Secrets Manager | Credentials DB gérés automatiquement |
| Réseau | VPC | Isolation réseau public/privé |
| Monitoring | CloudWatch | Logs ECS + Alarmes |
| Infrastructure | Terraform | 10 modules réutilisables |
| CI/CD | GitHub Actions | 4 workflows avec OIDC |
| Sécurité | CodeQL, Gitleaks, Trivy | Scan code, secrets, images, IaC |

---

## 🛠 Technologies

| Catégorie | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript 5 |
| **Backend** | Node.js 20, Express 4, TypeScript 5 |
| **Database** | PostgreSQL 16 (RDS) |
| **Container** | Docker (multi-stage), ECR |
| **IaC** | Terraform 1.9+ |
| **CI/CD** | GitHub Actions |
| **Auth AWS** | OIDC (aucune clé permanente) |
| **Sécurité** | CodeQL, Gitleaks, Trivy, ECR Scan |

---

## ⚡ Quick Start

### 1. Bootstrap (une seule fois)

```bash
# Créer les ressources pour le remote state Terraform
cd terraform/bootstrap
terraform init
terraform apply
```

### 2. Déployer l'infrastructure

```bash
cd terraform/environments/dev
terraform init
terraform plan
terraform apply
```

### 3. Configurer GitHub

Ajouter les **Variables** suivantes dans GitHub → Settings → Secrets and variables → Actions → Variables :

| Variable | Valeur |
|---|---|
| `AWS_ROLE_ARN_TERRAFORM` | `arn:aws:iam::ACCOUNT_ID:role/taskmanager-github-terraform-role` |
| `AWS_ROLE_ARN_DEPLOY` | `arn:aws:iam::ACCOUNT_ID:role/taskmanager-github-deploy-role` |
| `FRONTEND_BUCKET` | Sortie Terraform `frontend_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | Sortie Terraform `cloudfront_distribution_id` |
| `CLOUDFRONT_DOMAIN` | Sortie Terraform `cloudfront_domain_name` |
| `ALB_DNS_NAME` | Sortie Terraform `alb_dns_name` |
| `ECS_CLUSTER_NAME` | Sortie Terraform `ecs_cluster_name` |
| `ECS_SERVICE_NAME` | Sortie Terraform `ecs_service_name` |
| `ECS_TASK_FAMILY` | `taskmanager-dev-backend` |
| `API_URL` | `http://ALB_DNS_NAME` |

### 4. Déployer l'application

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

Les GitHub Actions déploieront automatiquement le backend et le frontend.

### 5. Accéder à l'application

- **Frontend** : `https://CLOUDFRONT_DOMAIN`
- **API** : `http://ALB_DNS_NAME/api`
- **Health** : `http://ALB_DNS_NAME/health`

---

## 📚 Prérequis

| Outil | Version | Installation |
|---|---|---|
| AWS CLI | v2+ | `brew install awscli` |
| Terraform | 1.5+ | `brew install terraform` |
| Node.js | 20+ | `brew install node` |
| Docker | 24+ | Docker Desktop |
| Git | 2.0+ | `brew install git` |

---

## 🏗 Infrastructure

### Modules Terraform

```
terraform/modules/
├── network/      — VPC, Subnets, IGW, NAT, Routes
├── security/     — Security Groups (ALB, ECS, RDS)
├── ecr/          — Container Registry
├── rds/          — PostgreSQL Database
├── secrets/      — Secrets Manager
├── alb/          — Load Balancer + Target Group
├── ecs/          — ECS Cluster + Service + Task Def
├── frontend/     — S3 + CloudFront (OAC)
├── monitoring/   — CloudWatch Logs + Alarms
└── github-oidc/  — OIDC Provider + IAM Roles
```

### Environnements

| Env | ECS Tasks | RDS Instance | NAT GW | Multi-AZ | Deletion Protection |
|---|---|---|---|---|---|
| **dev** | 1 | db.t4g.micro | 1 | Non | Non |
| **preprod** | 1 | db.t4g.small | 1 | Non | Non |
| **prod** | 2+ | db.t4g.medium | 2 | Oui | Oui |

### Commandes Terraform

```bash
make init ENV=dev          # terraform init
make fmt                   # terraform fmt -recursive
make validate ENV=dev      # terraform validate
make plan ENV=dev          # terraform plan
make apply ENV=dev         # terraform apply
make destroy ENV=dev       # terraform destroy
```

---

## 🔄 CI/CD

### Workflows GitHub Actions

| Workflow | Trigger | Actions |
|---|---|---|
| `security.yml` | Push main, PR | Gitleaks, CodeQL, Trivy FS, Trivy IaC |
| `terraform.yml` | Push/PR `terraform/**` | Format, Validate, Plan, Apply (main) |
| `backend-ci-cd.yml` | Push/PR `backend/**` | Test, Build, Trivy, ECR, ECS Deploy |
| `frontend-ci-cd.yml` | Push/PR `frontend/**` | Test, Build, S3 Sync, CloudFront |

### Flux PR

```
PR → Lint → Tests → CodeQL → Gitleaks → Trivy → Terraform Plan
(Aucun déploiement sur PR)
```

### Flux Main

```
Merge → Tests → Scans → Docker Build → Trivy Image → ECR Push → ECS Deploy → Health Check
```

---

## 🔒 Sécurité

| Outil | Cible | Ce qu'il détecte |
|---|---|---|
| **Gitleaks** | Repository | AWS keys, passwords, tokens, secrets |
| **CodeQL** | JS/TS code | Vulnérabilités code (XSS, injection, etc.) |
| **Trivy FS** | Dépendances | CVEs dans npm packages |
| **Trivy IaC** | Terraform | Misconfigurations (S3 public, SG ouvert, etc.) |
| **Trivy Image** | Docker image | CVEs dans l'image conteneur |
| **ECR Scan** | Image poussée | Scan Amazon Inspector complémentaire |

### Principes de sécurité

- ✅ **OIDC** : Aucune clé AWS permanente dans GitHub
- ✅ **Secrets Manager** : Credentials DB gérés automatiquement par RDS
- ✅ **Private subnets** : ECS et RDS non exposés directement à Internet
- ✅ **Security Groups** : Principe du moindre privilège (ALB→ECS→RDS)
- ✅ **S3 privé** : Frontend accessible uniquement via CloudFront (OAC)
- ✅ **IAM least privilege** : Rôles séparés (terraform vs deploy)
- ✅ **Docker non-root** : Conteneur exécuté en utilisateur `node`
- ✅ **Images immutables** : Tags basés sur Git SHA

---

## 📖 Documentation

### Documentation Markdown

Voir le dossier [docs/](docs/) pour la documentation complète :

1. [Architecture](docs/01-architecture.md)
2. [Network](docs/02-network.md)
3. [Terraform](docs/03-terraform.md)
4. [RDS](docs/04-rds.md)
5. [Secrets Manager](docs/05-secrets-manager.md)
6. [ECR](docs/06-ecr.md)
7. [ECS](docs/07-ecs.md)
8. [S3 & CloudFront](docs/08-s3-cloudfront.md)
9. [GitHub OIDC](docs/09-github-oidc.md)
10. [GitHub Actions](docs/10-github-actions.md)
11. [Security](docs/11-security.md)
12. [Deployment](docs/12-deployment.md)
13. [Monitoring](docs/13-monitoring.md)
14. [Troubleshooting](docs/14-troubleshooting.md)
15. [Destroy](docs/15-destroy.md)

### Documentation HTML

Ouvrir `docs/html/index.html` dans un navigateur pour le tutoriel interactif complet.

---

## 💰 Coûts AWS

### Estimation mensuelle (environnement DEV)

| Service | Coût estimé / mois |
|---|---|
| NAT Gateway | ~32 $ |
| ALB | ~18 $ |
| ECS Fargate (256 CPU, 512 MB) | ~10 $ |
| RDS PostgreSQL (db.t4g.micro) | ~15 $ |
| CloudFront | ~1 $ (faible trafic) |
| ECR | ~1 $ |
| S3 | < 1 $ |
| Secrets Manager | < 1 $ |
| CloudWatch | < 1 $ |
| **Total DEV** | **~80 $ / mois** |

> ⚠️ **NAT Gateway** représente ~40% du coût. Pour un LAB, considérez l'utiliser uniquement pendant les tests.

### Réduction des coûts

- Utiliser `terraform destroy` après chaque session de LAB
- Stopper les tâches ECS manuellement quand non utilisées
- Considérer un NAT Instance au lieu d'un NAT Gateway

---

## 🧹 Destruction du LAB

```bash
# 1. Vider le bucket S3 frontend
aws s3 rm s3://BUCKET_NAME --recursive

# 2. Supprimer les images ECR
aws ecr batch-delete-image --repository-name taskmanager-backend --image-ids "$(aws ecr list-images --repository-name taskmanager-backend --query 'imageIds[*]' --output json)"

# 3. Détruire l'infrastructure
cd terraform/environments/dev
terraform destroy

# 4. Détruire le remote state (optionnel)
cd terraform/bootstrap
terraform destroy
```

> ⚠️ En production, `deletion_protection` est activé sur RDS. Désactivez-le avant `terraform destroy`.

---

## 📁 Structure du projet

```
projet-aws/
├── frontend/            # React + Vite + TypeScript
├── backend/             # Node.js + Express + TypeScript
├── terraform/
│   ├── modules/         # 10 modules réutilisables
│   ├── environments/    # dev, preprod, prod
│   └── bootstrap/       # Remote state S3 + DynamoDB
├── .github/workflows/   # 4 pipelines CI/CD
├── docs/                # Documentation Markdown + HTML
├── diagrams/            # Diagrammes Mermaid
├── Makefile             # Commandes de développement
└── README.md            # Ce fichier
```

---

## 🎓 Objectif pédagogique

Ce projet est conçu pour être utilisé comme support de formation DevOps / DevSecOps. Il couvre :

- **Infrastructure as Code** avec Terraform et modules réutilisables
- **Conteneurisation** avec Docker multi-stage
- **Orchestration** avec ECS Fargate
- **CI/CD** avec GitHub Actions et OIDC
- **Sécurité** intégrée à chaque étape (DevSecOps)
- **Bonnes pratiques** AWS (VPC, Security Groups, IAM least privilege)
- **Documentation** professionnelle

---

## 📄 License

MIT License — voir [LICENSE](LICENSE)
