# 📘 Guide de Mise en Place — Étape par Étape

## Table des matières

1. [Prérequis et préparation de l'environnement](#étape-1--prérequis-et-préparation-de-lenvironnement)
2. [Cloner le repository et comprendre la structure](#étape-2--cloner-le-repository-et-comprendre-la-structure)
3. [Configurer AWS CLI et les credentials](#étape-3--configurer-aws-cli-et-les-credentials)
4. [Bootstrap Terraform — Remote State](#étape-4--bootstrap-terraform--remote-state)
5. [Déployer l'infrastructure avec Terraform](#étape-5--déployer-linfrastructure-avec-terraform)
6. [Premier build et push Docker (ECR)](#étape-6--premier-build-et-push-docker-ecr)
7. [Configurer GitHub OIDC et les Variables](#étape-7--configurer-github-oidc-et-les-variables)
8. [Déployer le backend sur ECS](#étape-8--déployer-le-backend-sur-ecs)
9. [Déployer le frontend sur S3/CloudFront](#étape-9--déployer-le-frontend-sur-s3cloudfront)
10. [Vérifier le déploiement complet](#étape-10--vérifier-le-déploiement-complet)
11. [Tester les pipelines CI/CD](#étape-11--tester-les-pipelines-cicd)
12. [Vérifier la sécurité DevSecOps](#étape-12--vérifier-la-sécurité-devsecops)
13. [Monitoring et observabilité](#étape-13--monitoring-et-observabilité)
14. [Nettoyage et destruction du LAB](#étape-14--nettoyage-et-destruction-du-lab)
15. [Résumé des coûts et recommandations](#étape-15--résumé-des-coûts-et-recommandations)

---

## Étape 1 — Prérequis et préparation de l'environnement

### 1.1 — Installer les outils requis

Avant de commencer, vous devez installer les outils suivants sur votre machine.

#### macOS (avec Homebrew)

```bash
# Installer Homebrew (si pas encore installé)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer les outils
brew install awscli        # AWS CLI v2
brew install terraform     # Terraform 1.5+
brew install node          # Node.js 20+
brew install git           # Git 2.0+
brew install jq            # JSON processor (utile pour parser les outputs)

# Docker Desktop — télécharger depuis https://www.docker.com/products/docker-desktop/
```

#### Linux (Ubuntu/Debian)

```bash
# AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Node.js 20 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Se déconnecter et reconnecter pour que le groupe prenne effet

# jq
sudo apt install -y jq
```

#### Windows (avec Chocolatey ou Scoop)

```powershell
# Avec Scoop
scoop install aws terraform nodejs git jq

# Docker Desktop — télécharger depuis https://www.docker.com/products/docker-desktop/
```

### 1.2 — Vérifier les installations

```bash
aws --version          # aws-cli/2.x.x
terraform --version    # Terraform v1.5+
node --version         # v20.x.x
npm --version          # 10.x.x
docker --version       # Docker version 24+
git --version          # git version 2.x
jq --version           # jq-1.x
```

> ⚠️ **Important** : Si une version est trop ancienne, mettez à jour l'outil avant de continuer.

### 1.3 — Créer un compte AWS

Si vous n'avez pas de compte AWS :

1. Aller sur [aws.amazon.com](https://aws.amazon.com)
2. Cliquer **Créer un compte AWS**
3. Renseigner email, mot de passe, informations de facturation
4. Vérifier votre identité (téléphone)
5. Choisir le plan **Basic (Free Tier)**

> ⚠️ **Coûts** : Ce projet coûte environ **80 $/mois** en environnement DEV. Pensez à `terraform destroy` après chaque session de LAB.

### 1.4 — Créer un utilisateur IAM pour le déploiement initial

Le déploiement initial du bootstrap et de l'OIDC nécessite un utilisateur IAM avec des permissions administrateur (temporairement).

1. Aller dans **AWS Console → IAM → Users → Create user**
2. Nom : `terraform-bootstrap`
3. Attacher la policy **AdministratorAccess** (temporaire)
4. Créer des **Access Keys** (CLI)
5. Notez la `AWS_ACCESS_KEY_ID` et la `AWS_SECRET_ACCESS_KEY`

> 🔒 **Sécurité** : Cet utilisateur est temporaire. Après la mise en place d'OIDC, vous supprimerez ces clés.

### 1.5 — Créer un compte GitHub

1. Aller sur [github.com](https://github.com)
2. Créer un compte ou utiliser un compte existant
3. Créer un repository nommé `projet-aws` (ou le nom de votre choix)
4. Le repository peut être **public** ou **privé**

---

## Étape 2 — Cloner le repository et comprendre la structure

### 2.1 — Cloner le repository

```bash
git clone https://github.com/ranimturkirt-sketch/aws-project.git
cd projet-aws
```

### 2.2 — Explorer la structure du projet

```bash
# Voir l'arborescence complète
find . -not -path './.git/*' -not -path '*/node_modules/*' -type f | sort
```

La structure est organisée comme suit :

```
projet-aws/
│
├── 📁 backend/                  ← API REST Node.js/Express/TypeScript
│   ├── src/
│   │   ├── config/index.ts      ← Config + Secrets Manager integration
│   │   ├── database/            ← Connexion PostgreSQL + migrations
│   │   ├── repositories/        ← Requêtes SQL CRUD
│   │   ├── services/            ← Logique métier
│   │   ├── controllers/         ← Handlers HTTP
│   │   ├── routes/              ← Routes Express
│   │   ├── middleware/          ← Error handler, logger, CORS
│   │   └── server.ts            ← Point d'entrée
│   ├── tests/                   ← Tests unitaires Jest
│   ├── Dockerfile               ← Image Docker multi-stage
│   └── package.json
│
├── 📁 frontend/                 ← SPA React/Vite/TypeScript
│   ├── src/
│   │   ├── components/          ← Header, TaskForm, TaskItem, TaskList
│   │   ├── services/api.ts      ← Appels API fetch()
│   │   ├── types/task.ts        ← Types TypeScript
│   │   ├── App.tsx              ← Composant principal
│   │   └── App.css              ← Design dark mode
│   ├── index.html
│   └── package.json
│
├── 📁 terraform/
│   ├── 📁 bootstrap/            ← Remote state S3 + DynamoDB
│   ├── 📁 modules/              ← 10 modules réutilisables
│   │   ├── network/             ← VPC, Subnets, IGW, NAT, Routes
│   │   ├── security/            ← Security Groups (ALB→ECS→RDS)
│   │   ├── ecr/                 ← Container Registry (immutable)
│   │   ├── rds/                 ← PostgreSQL (managed password)
│   │   ├── secrets/             ← Secrets Manager data source
│   │   ├── alb/                 ← Load Balancer + Target Group
│   │   ├── ecs/                 ← ECS Cluster + Service + Task
│   │   ├── frontend/            ← S3 + CloudFront (OAC)
│   │   ├── monitoring/          ← CloudWatch Logs + Alarms
│   │   └── github-oidc/         ← OIDC Provider + IAM Roles
│   └── 📁 environments/
│       ├── dev/                 ← Config env développement
│       ├── preprod/             ← Config env pré-production
│       └── prod/                ← Config env production
│
├── 📁 .github/workflows/       ← 4 pipelines CI/CD
│   ├── security.yml             ← Scans de sécurité
│   ├── terraform.yml            ← Infrastructure as Code
│   ├── backend-ci-cd.yml        ← Backend CI/CD
│   └── frontend-ci-cd.yml       ← Frontend CI/CD
│
├── 📁 docs/                     ← Documentation Markdown (15 chapitres)
│   └── 📁 html/                 ← Documentation HTML interactive
│
├── 📁 diagrams/                 ← Diagrammes d'architecture (Mermaid)
├── .gitignore
├── .gitleaks.toml
├── Makefile
├── LICENSE
└── README.md
```

### 2.3 — Comprendre les flux de données

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUX FRONTEND                              │
│                                                              │
│  Utilisateur → CloudFront (CDN) → S3 Bucket (React SPA)     │
│                                                              │
│  CloudFront met en cache les fichiers statiques              │
│  S3 est PRIVÉ, accessible uniquement via CloudFront (OAC)   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    FLUX BACKEND                               │
│                                                              │
│  Utilisateur → ALB (port 80) → ECS Fargate (port 3000)      │
│                                     ↓                        │
│                              RDS PostgreSQL (port 5432)      │
│                                     ↓                        │
│                              Secrets Manager (credentials)   │
│                                                              │
│  ALB fait le health check sur /health                        │
│  ECS récupère les secrets au démarrage du conteneur          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    FLUX CI/CD                                 │
│                                                              │
│  git push → GitHub Actions → OIDC → AWS STS                  │
│                                ↓                              │
│                          Credentials temporaires (1h)         │
│                                ↓                              │
│                    ┌──── ECR (push image)                     │
│                    ├──── ECS (deploy service)                 │
│                    ├──── S3 (sync frontend)                   │
│                    └──── CloudFront (invalidation)            │
└──────────────────────────────────────────────────────────────┘
```

---

## Étape 3 — Configurer AWS CLI et les credentials

### 3.1 — Configurer le profil AWS

```bash
aws configure
```

Renseigner :
- **AWS Access Key ID** : (votre clé de l'étape 1.4)
- **AWS Secret Access Key** : (votre secret de l'étape 1.4)
- **Default region name** : `eu-west-3` (Paris)
- **Default output format** : `json`

### 3.2 — Vérifier la connexion

```bash
# Vérifier l'identité
aws sts get-caller-identity

# Résultat attendu :
# {
#     "UserId": "AIDA...",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/terraform-bootstrap"
# }
```

### 3.3 — Noter votre Account ID

```bash
# Sauvegarder l'Account ID (vous en aurez besoin plus tard)
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
echo "Votre Account ID : $AWS_ACCOUNT_ID"
```

> 📝 **Important** : Notez ce numéro de compte, il sera utilisé dans la configuration des GitHub Variables.

### 3.4 — Vérifier la région

```bash
aws configure get region
# Doit afficher : eu-west-3
```

---

## Étape 4 — Bootstrap Terraform — Remote State

### 4.1 — Pourquoi un bootstrap ?

Terraform stocke l'état de l'infrastructure dans un fichier `terraform.tfstate`. Par défaut, ce fichier est local, ce qui pose problème :

- **Perte** : Si vous supprimez le fichier, Terraform ne sait plus rien de votre infrastructure
- **Collaboration** : Impossible de travailler à plusieurs
- **Concurrence** : Risque de modifications simultanées

Le **remote state** résout ces problèmes :
- **S3** stocke le fichier d'état (versioning + chiffrement)
- **DynamoDB** empêche les modifications concurrentes (locking)

### 4.2 — Examiner la configuration bootstrap

```bash
cat terraform/bootstrap/main.tf
```

Ce fichier crée :
- Un bucket S3 `taskmanager-terraform-state-eu-west-3` (versioning, encryption, public access block)
- Une table DynamoDB `taskmanager-terraform-lock` (PAY_PER_REQUEST)

### 4.3 — Initialiser et appliquer le bootstrap

```bash
cd terraform/bootstrap

# Initialiser Terraform (télécharge le provider AWS)
terraform init
```

Sortie attendue :
```
Initializing the backend...
Initializing provider plugins...
- Installing hashicorp/aws v5.x.x...
Terraform has been successfully initialized!
```

```bash
# Prévisualiser les changements
terraform plan
```

Sortie attendue :
```
Plan: 5 to add, 0 to change, 0 to destroy.
```

```bash
# Appliquer les changements
terraform apply
```

Tapez `yes` quand demandé.

Sortie attendue :
```
Apply complete! Resources: 5 added, 0 changed, 0 destroyed.

Outputs:
state_bucket_name = "taskmanager-terraform-state-eu-west-3"
lock_table_name   = "taskmanager-terraform-lock"
```

### 4.4 — Vérifier le bootstrap

```bash
# Vérifier que le bucket S3 existe
aws s3 ls | grep taskmanager-terraform-state

# Vérifier que la table DynamoDB existe
aws dynamodb describe-table --table-name taskmanager-terraform-lock --query 'Table.TableStatus'
# Résultat : "ACTIVE"
```

### 4.5 — Revenir au répertoire racine

```bash
cd ../..
```

> ✅ **Checkpoint** : Le remote state est prêt. Terraform peut maintenant stocker son état de manière sécurisée.

---

## Étape 5 — Déployer l'infrastructure avec Terraform

### 5.1 — Examiner la configuration de l'environnement dev

```bash
# Voir les variables
cat terraform/environments/dev/terraform.tfvars

# Voir le main qui compose les modules
cat terraform/environments/dev/main.tf
```

Le fichier `main.tf` de l'environnement dev compose **10 modules** :

| Ordre | Module | Ce qu'il crée |
|---|---|---|
| 1 | `network` | VPC + 4 subnets + IGW + NAT |
| 2 | `security` | 3 Security Groups |
| 3 | `ecr` | Repository Docker |
| 4 | `monitoring` | CloudWatch Log Group |
| 5 | `rds` | PostgreSQL + Secret auto |
| 6 | `secrets` | Data source du secret RDS |
| 7 | `alb` | Load Balancer + Target Group |
| 8 | `ecs` | Cluster + Task + Service |
| 9 | `frontend` | S3 + CloudFront |
| 10 | `github_oidc` | OIDC Provider + 2 IAM Roles |

### 5.2 — Initialiser Terraform

```bash
cd terraform/environments/dev
terraform init
```

Sortie attendue :
```
Initializing the backend...
Successfully configured the backend "s3"!

Initializing modules...
- alb in ../../modules/alb
- ecr in ../../modules/ecr
- ecs in ../../modules/ecs
- frontend in ../../modules/frontend
- github_oidc in ../../modules/github-oidc
- monitoring in ../../modules/monitoring
- network in ../../modules/network
- rds in ../../modules/rds
- secrets in ../../modules/secrets
- security in ../../modules/security

Terraform has been successfully initialized!
```

### 5.3 — Vérifier la syntaxe

```bash
# Formatter le code (vérifie le formatting)
terraform fmt -check -recursive ../../

# Valider la syntaxe
terraform validate
```

### 5.4 — Planifier le déploiement

```bash
terraform plan -out=tfplan
```

Cette commande affiche TOUT ce que Terraform va créer. Examinez attentivement :

```
Plan: ~40 to add, 0 to change, 0 to destroy.
```

Vérifiez qu'il n'y a pas d'erreurs et que les ressources correspondent à vos attentes.

### 5.5 — Appliquer le déploiement

```bash
terraform apply tfplan
```

> ⏱️ **Durée** : Le déploiement prend environ **10-15 minutes**. Le plus long est la création du RDS (~5-8 min) et du CloudFront (~3-5 min).

### 5.6 — Récupérer les outputs

```bash
# Afficher toutes les sorties
terraform output

# Sauvegarder les valeurs importantes dans des variables
export ALB_DNS=$(terraform output -raw alb_dns_name)
export CF_DOMAIN=$(terraform output -raw cloudfront_domain_name)
export ECR_URL=$(terraform output -raw ecr_repository_url)
export ECS_CLUSTER=$(terraform output -raw ecs_cluster_name)
export ECS_SERVICE=$(terraform output -raw ecs_service_name)
export BUCKET_NAME=$(terraform output -raw frontend_bucket_name)
export CF_DIST_ID=$(terraform output -raw cloudfront_distribution_id)
export TERRAFORM_ROLE=$(terraform output -raw github_terraform_role_arn)
export DEPLOY_ROLE=$(terraform output -raw github_deploy_role_arn)

echo "============================================"
echo "ALB DNS:         $ALB_DNS"
echo "CloudFront:      $CF_DOMAIN"
echo "ECR URL:         $ECR_URL"
echo "ECS Cluster:     $ECS_CLUSTER"
echo "ECS Service:     $ECS_SERVICE"
echo "S3 Bucket:       $BUCKET_NAME"
echo "CF Dist ID:      $CF_DIST_ID"
echo "Terraform Role:  $TERRAFORM_ROLE"
echo "Deploy Role:     $DEPLOY_ROLE"
echo "============================================"
```

### 5.7 — Vérifier les ressources dans la console AWS

Allez dans la console AWS et vérifiez :

| Service | Vérification |
|---|---|
| **VPC** | VPC `taskmanager-dev-vpc` avec CIDR `10.0.0.0/16` |
| **EC2 → Subnets** | 4 subnets (2 publics, 2 privés) |
| **EC2 → Security Groups** | 3 SGs (alb, ecs, rds) |
| **ECS** | Cluster `taskmanager-dev-cluster` |
| **ECR** | Repository `taskmanager-backend` |
| **RDS** | Instance `taskmanager-dev-postgres` (Status: Available) |
| **ALB** | ALB `taskmanager-dev-alb` |
| **S3** | Bucket `taskmanager-dev-frontend-ACCOUNT_ID` |
| **CloudFront** | Distribution en statut `Deployed` |
| **IAM** | 2 rôles GitHub (`terraform-role`, `deploy-role`) |
| **Secrets Manager** | Secret auto-créé par RDS |

```bash
cd ../../..
```

> ✅ **Checkpoint** : L'infrastructure AWS est déployée. Les services sont prêts à recevoir l'application.

---

## Étape 6 — Premier build et push Docker (ECR)

### 6.1 — Installer les dépendances backend (local)

```bash
cd backend
npm ci
```

### 6.2 — Exécuter les tests en local

```bash
# Linter
npm run lint

# Build TypeScript
npm run build

# Tests unitaires
npm test
```

Sortie attendue :
```
PASS  tests/health.test.ts
  ✓ Health check returns 200 (xx ms)
  ✓ ...

Test Suites: 1 passed, 1 total
Tests:       x passed, x total
```

### 6.3 — Builder l'image Docker en local

```bash
docker build -t taskmanager-backend:test .
```

Vérifier que l'image est créée :
```bash
docker images | grep taskmanager-backend
# taskmanager-backend   test   xxx   xx seconds ago   xxMB
```

### 6.4 — Se connecter à ECR

```bash
# Login ECR (remplacez par votre Account ID et région)
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin $ECR_URL
```

Sortie attendue :
```
Login Succeeded
```

### 6.5 — Taguer et pousser l'image

```bash
# Taguer l'image avec l'URL ECR
IMAGE_TAG="initial"
docker tag taskmanager-backend:test $ECR_URL:$IMAGE_TAG

# Pousser vers ECR
docker push $ECR_URL:$IMAGE_TAG
```

Sortie attendue :
```
The push refers to repository [123456789012.dkr.ecr.eu-west-3.amazonaws.com/taskmanager-backend]
initial: digest: sha256:... size: ...
```

### 6.6 — Vérifier l'image dans ECR

```bash
aws ecr describe-images --repository-name taskmanager-backend --query 'imageDetails[*].{Tag:imageTags[0],Size:imageSizeInBytes,Pushed:imagePushedAt}' --output table
```

### 6.7 — Vérifier le scan de vulnérabilités

```bash
# ECR scanne automatiquement les images (scan on push)
aws ecr describe-image-scan-findings --repository-name taskmanager-backend --image-id imageTag=$IMAGE_TAG --query 'imageScanFindings.findingSeverityCounts'
```

```bash
cd ..
```

> ✅ **Checkpoint** : L'image Docker est dans ECR et a été scannée. Le service ECS peut maintenant la déployer.

---

## Étape 7 — Configurer GitHub OIDC et les Variables

### 7.1 — Pousser le code sur GitHub

```bash
# Ajouter le remote GitHub (si pas déjà fait)
git remote add origin https://github.com/ranimturkirt-sketch/aws-project.git

# Ajouter tous les fichiers
git add .
git commit -m "Initial commit — DevSecOps AWS project"

# NE PAS ENCORE PUSH — configurez d'abord les variables GitHub
```

### 7.2 — Configurer les Variables GitHub Actions

Allez dans votre repository GitHub :

**Settings → Secrets and variables → Actions → Variables (tab)**

Cliquez **New repository variable** pour chaque variable :

| Variable | Valeur | Comment l'obtenir |
|---|---|---|
| `AWS_ROLE_ARN_TERRAFORM` | `arn:aws:iam::ACCOUNT_ID:role/taskmanager-github-terraform-role` | `terraform output github_terraform_role_arn` |
| `AWS_ROLE_ARN_DEPLOY` | `arn:aws:iam::ACCOUNT_ID:role/taskmanager-github-deploy-role` | `terraform output github_deploy_role_arn` |
| `FRONTEND_BUCKET` | `taskmanager-dev-frontend-ACCOUNT_ID` | `terraform output frontend_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E1ABC2DEF3GH4I` | `terraform output cloudfront_distribution_id` |
| `CLOUDFRONT_DOMAIN` | `d1abc2def3gh4i.cloudfront.net` | `terraform output cloudfront_domain_name` |
| `ALB_DNS_NAME` | `taskmanager-dev-alb-123456789.eu-west-3.elb.amazonaws.com` | `terraform output alb_dns_name` |
| `ECS_CLUSTER_NAME` | `taskmanager-dev-cluster` | `terraform output ecs_cluster_name` |
| `ECS_SERVICE_NAME` | `taskmanager-dev-service` | `terraform output ecs_service_name` |
| `ECS_TASK_FAMILY` | `taskmanager-dev-backend` | Fixe |
| `API_URL` | `http://ALB_DNS_NAME` | L'URL de l'ALB |

### 7.3 — Créer l'environnement de déploiement (optionnel)

Pour ajouter une approbation manuelle avant le déploiement Terraform :

1. **Settings → Environments → New environment**
2. Nom : `production`
3. Activer **Required reviewers** et ajoutez-vous
4. Cela bloquera le `terraform apply` jusqu'à votre approbation

### 7.4 — Configurer les permissions du repository

Pour que les workflows OIDC fonctionnent :

1. **Settings → Actions → General**
2. Sous **Workflow permissions**, sélectionnez **Read and write permissions**
3. Cochez **Allow GitHub Actions to create and approve pull requests**

### 7.5 — Vérifier la configuration OIDC

```bash
# Vérifier que le provider OIDC est créé dans AWS
aws iam list-open-id-connect-providers

# Vérifier les rôles GitHub
aws iam get-role --role-name taskmanager-github-terraform-role --query 'Role.Arn'
aws iam get-role --role-name taskmanager-github-deploy-role --query 'Role.Arn'
```

> ✅ **Checkpoint** : GitHub est configuré pour s'authentifier à AWS via OIDC, sans aucune clé permanente.

---

## Étape 8 — Déployer le backend sur ECS

### 8.1 — Premier déploiement via git push

```bash
git push origin main
```

Cela déclenche automatiquement les workflows suivants :
- `security.yml` — Scans de sécurité
- `backend-ci-cd.yml` — Build + Deploy backend
- `terraform.yml` — (ne se déclenche que si terraform/ change)

### 8.2 — Suivre le déploiement dans GitHub

1. Aller sur **GitHub → Actions**
2. Vous devriez voir les workflows en cours d'exécution
3. Cliquez sur `🚀 Backend CI/CD` pour suivre la progression

#### Étapes du workflow backend :

```
1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies (npm ci)
4. ✅ Lint (eslint)
5. ✅ Build TypeScript
6. ✅ Run Tests (Jest)
7. ✅ Configure AWS Credentials (OIDC)
8. ✅ Login to ECR
9. ✅ Build Docker image
10. ✅ Scan Docker image (Trivy)
11. ✅ Push to ECR (tag: SHA du commit)
12. ✅ Update ECS Task Definition
13. ✅ Deploy to ECS
14. ✅ Wait for service stability
15. ✅ Health check
```

### 8.3 — Vérifier le déploiement ECS

```bash
# Vérifier le status du service ECS
aws ecs describe-services \
  --cluster taskmanager-dev-cluster \
  --services taskmanager-dev-service \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,Deployments:deployments[0].rolloutState}'

# Résultat attendu :
# {
#     "Status": "ACTIVE",
#     "Running": 1,
#     "Desired": 1,
#     "Deployments": "COMPLETED"
# }
```

### 8.4 — Vérifier les logs

```bash
# Voir les derniers logs de l'application
aws logs tail /ecs/taskmanager-dev-backend --since 5m --format short
```

### 8.5 — Tester l'API

```bash
# Health check
curl http://$ALB_DNS/health
# Résultat attendu : {"status":"healthy","timestamp":"...","environment":"production"}

# Lister les tâches (vide au début)
curl http://$ALB_DNS/api/tasks
# Résultat attendu : []

# Créer une tâche
curl -X POST http://$ALB_DNS/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Ma première tâche","description":"Apprendre DevSecOps"}'
# Résultat attendu : {"id":1,"title":"Ma première tâche",...}

# Vérifier la tâche créée
curl http://$ALB_DNS/api/tasks
# Résultat attendu : [{"id":1,"title":"Ma première tâche",...}]
```

> ✅ **Checkpoint** : Le backend tourne sur ECS Fargate, connecté à RDS, et accessible via l'ALB.

---

## Étape 9 — Déployer le frontend sur S3/CloudFront

### 9.1 — Vérifier que le frontend workflow a tourné

Si vous avez poussé tout le code en une fois, le workflow `frontend-ci-cd.yml` a déjà tourné.

Sinon, faites une modification dans `frontend/` et poussez :

```bash
# Faire un changement mineur pour déclencher le workflow
echo "" >> frontend/src/App.tsx
git add frontend/
git commit -m "chore: trigger frontend deployment"
git push origin main
```

### 9.2 — Suivre le déploiement frontend

Dans **GitHub → Actions → 🎨 Frontend CI/CD** :

```
1. ✅ Checkout
2. ✅ Setup Node.js 20
3. ✅ Install dependencies
4. ✅ Lint
5. ✅ Build (with VITE_API_URL)
6. ✅ Test
7. ✅ Configure AWS Credentials (OIDC)
8. ✅ Sync to S3
9. ✅ Invalidate CloudFront
```

### 9.3 — Vérifier le contenu S3

```bash
# Lister les fichiers dans le bucket
aws s3 ls s3://$BUCKET_NAME/ --recursive

# Vous devriez voir :
# index.html
# assets/index-xxx.js
# assets/index-xxx.css
# vite.svg
```

### 9.4 — Accéder au frontend

Ouvrez dans votre navigateur :

```
https://VOTRE_CF_DOMAIN
```

Ou avec curl :
```bash
curl -s -o /dev/null -w "%{http_code}" https://$CF_DOMAIN
# Résultat attendu : 200
```

### 9.5 — Tester l'application complète

1. Ouvrez `https://VOTRE_CF_DOMAIN` dans un navigateur
2. Vous devriez voir l'interface Task Manager avec le design dark mode
3. Créez une tâche via le formulaire
4. Cochez une tâche comme terminée
5. Testez les filtres (Toutes, En cours, Terminées)
6. Supprimez une tâche

> ⚠️ **Si les tâches ne se chargent pas** : Vérifiez que `VITE_API_URL` pointe vers l'ALB et que le CORS est configuré.

> ✅ **Checkpoint** : L'application complète fonctionne ! Frontend sur CloudFront, Backend sur ECS, Database sur RDS.

---

## Étape 10 — Vérifier le déploiement complet

### 10.1 — Checklist de vérification

| Composant | Commande de vérification | Résultat attendu |
|---|---|---|
| VPC | `aws ec2 describe-vpcs --filters "Name=tag:Project,Values=taskmanager" --query 'Vpcs[].CidrBlock'` | `10.0.0.0/16` |
| Subnets | `aws ec2 describe-subnets --filters "Name=tag:Project,Values=taskmanager" --query 'Subnets[].CidrBlock'` | 4 CIDRs |
| ALB | `curl -s -o /dev/null -w "%{http_code}" http://$ALB_DNS/health` | `200` |
| API | `curl http://$ALB_DNS/api/tasks` | `[]` ou tâches |
| Frontend | `curl -s -o /dev/null -w "%{http_code}" https://$CF_DOMAIN` | `200` |
| ECR | `aws ecr describe-repositories --query 'repositories[].repositoryName'` | `taskmanager-backend` |
| ECS | `aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --query 'services[0].runningCount'` | `1` |
| RDS | `aws rds describe-db-instances --db-instance-identifier taskmanager-dev-postgres --query 'DBInstances[0].DBInstanceStatus'` | `available` |
| S3 | `aws s3 ls s3://$BUCKET_NAME --summarize --human-readable \| tail -2` | Fichiers présents |
| CloudFront | `aws cloudfront get-distribution --id $CF_DIST_ID --query 'Distribution.Status'` | `Deployed` |

### 10.2 — Test end-to-end automatisé

```bash
#!/bin/bash
echo "🔍 Test End-to-End du projet DevSecOps"
echo "======================================="

# 1. Health check backend
echo -n "1. Health check: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$ALB_DNS/health)
[ "$STATUS" = "200" ] && echo "✅ OK ($STATUS)" || echo "❌ FAIL ($STATUS)"

# 2. Créer une tâche
echo -n "2. Créer tâche: "
TASK=$(curl -s -X POST http://$ALB_DNS/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test E2E","description":"Test automatisé"}')
TASK_ID=$(echo $TASK | jq -r '.id')
[ -n "$TASK_ID" ] && echo "✅ ID=$TASK_ID" || echo "❌ FAIL"

# 3. Lire la tâche
echo -n "3. Lire tâche: "
READ=$(curl -s http://$ALB_DNS/api/tasks/$TASK_ID | jq -r '.title')
[ "$READ" = "Test E2E" ] && echo "✅ OK" || echo "❌ FAIL ($READ)"

# 4. Modifier la tâche
echo -n "4. Modifier tâche: "
curl -s -X PUT http://$ALB_DNS/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' > /dev/null
COMPLETED=$(curl -s http://$ALB_DNS/api/tasks/$TASK_ID | jq -r '.completed')
[ "$COMPLETED" = "true" ] && echo "✅ OK" || echo "❌ FAIL"

# 5. Supprimer la tâche
echo -n "5. Supprimer tâche: "
DEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE http://$ALB_DNS/api/tasks/$TASK_ID)
[ "$DEL_STATUS" = "204" ] && echo "✅ OK" || echo "❌ FAIL ($DEL_STATUS)"

# 6. Frontend
echo -n "6. Frontend CloudFront: "
CF_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$CF_DOMAIN)
[ "$CF_STATUS" = "200" ] && echo "✅ OK" || echo "❌ FAIL ($CF_STATUS)"

echo "======================================="
echo "✅ Tests terminés !"
```

> ✅ **Checkpoint** : Tout fonctionne de bout en bout. L'application est déployée en production.

---

## Étape 11 — Tester les pipelines CI/CD

### 11.1 — Déclencher un scan de sécurité

Le workflow `security.yml` se déclenche automatiquement à chaque push. Pour le tester :

```bash
# Faire une modification et pousser
echo "# test" >> README.md
git add . && git commit -m "test: trigger security scan" && git push
```

Vérifiez dans **GitHub → Actions → 🔒 Security Scans** :
- ✅ Gitleaks — Aucun secret détecté
- ✅ CodeQL — Aucune vulnérabilité code
- ✅ Trivy FS — Aucune vulnérabilité critique
- ✅ Trivy IaC — Aucune misconfiguration critique

### 11.2 — Tester une Pull Request

```bash
# Créer une branche
git checkout -b feature/test-pipeline

# Faire une modification
echo "// Test pipeline" >> backend/src/server.ts

# Commiter et pousser
git add . && git commit -m "test: pipeline PR"
git push origin feature/test-pipeline
```

Créer une Pull Request dans GitHub. Les workflows vont exécuter :
- Les tests (sans déploiement)
- Le `terraform plan` (affiché en commentaire dans la PR)
- Les scans de sécurité

**Aucun déploiement ne se fait sur une PR** — seulement sur `main`.

### 11.3 — Merger et déployer

Mergez la PR dans GitHub → le déploiement automatique se déclenche.

---

## Étape 12 — Vérifier la sécurité DevSecOps

### 12.1 — Tableau des scans

| Scan | Outil | Ce qu'il vérifie | Bloquant ? |
|---|---|---|---|
| Secrets | Gitleaks | Clés AWS, mots de passe, tokens dans le code | ✅ Oui |
| Code | CodeQL | XSS, injection SQL, vulnérabilités JS/TS | ✅ Oui |
| Dépendances | Trivy FS | CVEs dans les packages npm | ✅ Oui (HIGH/CRITICAL) |
| Infrastructure | Trivy IaC | Misconfigurations Terraform | ✅ Oui (HIGH/CRITICAL) |
| Images Docker | Trivy Image | CVEs dans l'image conteneur | ✅ Oui (HIGH/CRITICAL) |
| Images ECR | Amazon Inspector | Scan complémentaire post-push | ❌ Non-bloquant |

### 12.2 — Tester la détection de secrets

```bash
# ⚠️ NE FAITES PAS CECI en vrai — c'est un test
# Créer un fichier avec un faux secret
echo 'AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' > test-secret.txt
git add test-secret.txt
git commit -m "test: fake secret"
git push origin main

# Le workflow Gitleaks devrait ÉCHOUER ❌
# Vérifiez dans GitHub Actions
```

Nettoyez immédiatement :
```bash
git rm test-secret.txt
git commit -m "fix: remove test secret"
git push origin main
```

### 12.3 — Vérifier les Security Groups

```bash
# ALB SG — doit accepter 80/443 depuis Internet
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=*alb-sg*" \
  --query 'SecurityGroups[0].IpPermissions[*].{Port:FromPort,Source:IpRanges[0].CidrIp}'

# ECS SG — doit accepter 3000 depuis ALB SG UNIQUEMENT
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=*ecs-sg*" \
  --query 'SecurityGroups[0].IpPermissions[*].{Port:FromPort,Source:UserIdGroupPairs[0].GroupId}'

# RDS SG — doit accepter 5432 depuis ECS SG UNIQUEMENT
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=*rds-sg*" \
  --query 'SecurityGroups[0].IpPermissions[*].{Port:FromPort,Source:UserIdGroupPairs[0].GroupId}'
```

### 12.4 — Vérifier OIDC (pas de clés permanentes)

```bash
# Vérifier qu'il n'y a PAS de secrets GitHub (pas de AWS_ACCESS_KEY_ID)
# Allez dans GitHub → Settings → Secrets and variables → Actions → Secrets
# La liste devrait être VIDE (seulement des Variables, pas de Secrets)
```

> ✅ **Checkpoint** : La sécurité est en place à chaque niveau : code, secrets, images, infrastructure, auth.

---

## Étape 13 — Monitoring et observabilité

### 13.1 — Voir les logs applicatifs

```bash
# Derniers logs (5 minutes)
aws logs tail /ecs/taskmanager-dev-backend --since 5m

# Suivre en temps réel
aws logs tail /ecs/taskmanager-dev-backend --follow

# Filtrer les erreurs
aws logs filter-log-events \
  --log-group-name /ecs/taskmanager-dev-backend \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s000 2>/dev/null || date -v-1H +%s000)
```

### 13.2 — Voir les métriques ECS

```bash
# CPU utilisation
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=taskmanager-dev-cluster Name=ServiceName,Value=taskmanager-dev-service \
  --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%S 2>/dev/null || date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --query 'Datapoints[*].{Time:Timestamp,CPU:Average}'
```

### 13.3 — Vérifier les health checks ALB

```bash
# État des targets dans le Target Group
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --names taskmanager-dev-tg --query 'TargetGroups[0].TargetGroupArn' --output text) \
  --query 'TargetHealthDescriptions[*].{Target:Target.Id,Port:Target.Port,State:TargetHealth.State}'

# Résultat attendu :
# [{ "Target": "10.0.10.x", "Port": 3000, "State": "healthy" }]
```

### 13.4 — Console CloudWatch (GUI)

1. Aller dans **AWS Console → CloudWatch → Log Groups**
2. Cliquer sur `/ecs/taskmanager-dev-backend`
3. Explorer les log streams
4. Utiliser **Log Insights** pour des requêtes avancées :

```
# Requête CloudWatch Insights
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
```

> ✅ **Checkpoint** : Le monitoring est en place. Vous pouvez voir les logs et métriques de l'application.

---

## Étape 14 — Nettoyage et destruction du LAB

> ⚠️ **IMPORTANT** : Suivez l'ordre de destruction pour éviter les erreurs de dépendances.

### 14.1 — Vider le bucket S3 frontend

```bash
# S3 ne peut pas être supprimé s'il contient des fichiers
aws s3 rm s3://$BUCKET_NAME --recursive
```

### 14.2 — Supprimer les images ECR

```bash
# Lister les images
aws ecr list-images --repository-name taskmanager-backend --query 'imageIds[*]'

# Supprimer toutes les images
aws ecr batch-delete-image \
  --repository-name taskmanager-backend \
  --image-ids "$(aws ecr list-images --repository-name taskmanager-backend --query 'imageIds[*]' --output json)"
```

### 14.3 — Détruire l'infrastructure

```bash
cd terraform/environments/dev

# Planifier la destruction
terraform plan -destroy

# Détruire (tapez 'yes')
terraform destroy
```

> ⏱️ **Durée** : La destruction prend environ **10-15 minutes** (RDS et CloudFront sont les plus longs).

### 14.4 — Détruire le bootstrap (optionnel)

Si vous ne comptez plus utiliser le projet :

```bash
cd ../../bootstrap

# Le bucket S3 d'état a la protection lifecycle
# Vous devez commenter 'prevent_destroy = true' dans main.tf avant de détruire
terraform destroy
```

### 14.5 — Supprimer l'utilisateur IAM temporaire

```bash
# Supprimer les access keys
aws iam delete-access-key --user-name terraform-bootstrap --access-key-id VOTRE_KEY_ID

# Détacher la policy
aws iam detach-user-policy --user-name terraform-bootstrap --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Supprimer l'utilisateur
aws iam delete-user --user-name terraform-bootstrap
```

### 14.6 — Vérifier la destruction complète

```bash
# Vérifier qu'il n'y a plus de VPC
aws ec2 describe-vpcs --filters "Name=tag:Project,Values=taskmanager" --query 'Vpcs[].VpcId'
# Résultat attendu : []

# Vérifier qu'il n'y a plus de RDS
aws rds describe-db-instances --query 'DBInstances[?DBInstanceIdentifier==`taskmanager-dev-postgres`].DBInstanceStatus'
# Résultat attendu : []
```

> ✅ **Checkpoint** : Tout est nettoyé. Aucune ressource AWS ne tourne plus.

---

## Étape 15 — Résumé des coûts et recommandations

### 15.1 — Coûts mensuels estimés (DEV)

| Service | Coût / mois | % du total |
|---|---|---|
| NAT Gateway | ~32 $ | 40% |
| ALB | ~18 $ | 22% |
| RDS (db.t4g.micro) | ~15 $ | 19% |
| ECS Fargate (256/512) | ~10 $ | 12% |
| CloudFront | ~1 $ | 1% |
| ECR | ~1 $ | 1% |
| S3 | < 1 $ | < 1% |
| Secrets Manager | < 1 $ | < 1% |
| CloudWatch | < 1 $ | < 1% |
| DynamoDB (state lock) | < 1 $ | < 1% |
| **TOTAL** | **~80 $** | **100%** |

### 15.2 — Recommandations pour réduire les coûts

1. **Détruire après chaque session** : `terraform destroy` puis `terraform apply` le lendemain
2. **NAT Instance** : Remplacer le NAT Gateway par une NAT Instance (t3.nano = ~3 $/mois au lieu de 32 $)
3. **Spot Fargate** : Utiliser les instances Spot pour ECS en dev (jusqu'à -70%)
4. **RDS arrêté** : Vous pouvez stopper l'instance RDS dans la console quand non utilisée

### 15.3 — Bonnes pratiques pour la production

| Pratique | Dev | Prod |
|---|---|---|
| NAT Gateway | 1 (single) | 2 (par AZ) |
| RDS Multi-AZ | Non | Oui |
| RDS Backup | 1 jour | 30 jours |
| Deletion protection | Non | Oui |
| ECS tasks | 1 | 2+ (autoscaling) |
| CloudWatch alarms | Non | Oui |
| WAF | Non | Oui (à ajouter) |
| Route53 + ACM | Non | Oui (domaine custom) |

### 15.4 — Ce que vous avez appris

- ✅ Créer un VPC avec subnets publics/privés
- ✅ Configurer des Security Groups (moindre privilège)
- ✅ Déployer une base de données RDS avec secrets managés
- ✅ Conteneuriser une application et la pousser vers ECR
- ✅ Déployer des conteneurs sur ECS Fargate
- ✅ Héberger un SPA sur S3 + CloudFront
- ✅ Écrire des modules Terraform réutilisables
- ✅ Mettre en place des pipelines CI/CD avec GitHub Actions
- ✅ Utiliser OIDC pour l'authentification sans clés permanentes
- ✅ Intégrer des scans de sécurité à chaque étape

---

## Annexes

### A — Variables d'environnement complètes

```bash
# Exportez ces variables après le terraform apply
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
export AWS_REGION=eu-west-3
export ALB_DNS=$(cd terraform/environments/dev && terraform output -raw alb_dns_name)
export CF_DOMAIN=$(cd terraform/environments/dev && terraform output -raw cloudfront_domain_name)
export ECR_URL=$(cd terraform/environments/dev && terraform output -raw ecr_repository_url)
export ECS_CLUSTER=$(cd terraform/environments/dev && terraform output -raw ecs_cluster_name)
export ECS_SERVICE=$(cd terraform/environments/dev && terraform output -raw ecs_service_name)
export BUCKET_NAME=$(cd terraform/environments/dev && terraform output -raw frontend_bucket_name)
export CF_DIST_ID=$(cd terraform/environments/dev && terraform output -raw cloudfront_distribution_id)
```

### B — Commandes Makefile

```bash
make help              # Afficher l'aide
make init ENV=dev      # terraform init
make plan ENV=dev      # terraform plan
make apply ENV=dev     # terraform apply
make destroy ENV=dev   # terraform destroy
make fmt               # terraform fmt
make validate ENV=dev  # terraform validate
make docker-build      # Build Docker backend
make docker-push       # Push vers ECR
make frontend-build    # Build frontend
make frontend-deploy   # Deploy vers S3
```

### C — Troubleshooting rapide

| Problème | Solution |
|---|---|
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | Vérifier la trust policy du rôle OIDC |
| `CannotPullContainerError` | NAT Gateway manquant ou routes privées incorrectes |
| `ResourceInitializationError` | Vérifier que le secret ARN est correct dans la Task Definition |
| `UNHEALTHY` dans le Target Group | Vérifier les logs ECS, le health check sur `/health`, le port 3000 |
| `AccessDenied` sur S3 | Vérifier la bucket policy et l'OAC CloudFront |
| `terraform state lock` | `terraform force-unlock LOCK_ID` |
| `The security group does not exist` | Les SGs sont créés avec `name_prefix`, régénérer |

---

**🎉 Félicitations !** Vous avez déployé un projet DevSecOps AWS complet et professionnel.
