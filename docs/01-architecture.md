# Chapitre 1 — Architecture

## Objectif

Comprendre l'architecture complète du projet DevSecOps AWS Task Manager et le rôle de chaque composant.

## Pourquoi cette architecture ?

Ce projet reproduit une architecture de production réelle utilisée par des startups et des entreprises pour déployer des applications web. Chaque composant a été choisi pour une raison précise :

- **CloudFront + S3** : Distribuer le frontend proche des utilisateurs (CDN), réduire la latence
- **ALB + ECS Fargate** : Exécuter le backend sans gérer de serveurs, avec scaling automatique
- **RDS PostgreSQL** : Base de données managée avec backups automatiques
- **Secrets Manager** : Aucun mot de passe dans le code source
- **Terraform** : Infrastructure reproductible et versionnable
- **GitHub Actions + OIDC** : CI/CD sans clés AWS permanentes

## Architecture globale

### Frontend

```
Utilisateur → CloudFront (CDN) → S3 Bucket (React SPA)
```

**Pourquoi ?**
- CloudFront met en cache les fichiers statiques dans des edge locations proches des utilisateurs
- S3 est un stockage object hautement disponible et peu coûteux
- L'Origin Access Control (OAC) empêche l'accès direct au bucket S3

### Backend

```
Utilisateur → ALB → ECS Fargate → RDS PostgreSQL
                         ↓
                   Secrets Manager
```

**Pourquoi ?**
- L'ALB distribue le trafic vers les tâches ECS et effectue des health checks
- ECS Fargate exécute les conteneurs sans nécessiter de gestion d'instances EC2
- RDS est dans un subnet privé, inaccessible depuis Internet
- Les credentials sont gérés par Secrets Manager, jamais exposés

### Réseau

```
VPC 10.0.0.0/16
├── Public Subnets (ALB, NAT Gateway)
│   ├── 10.0.1.0/24 (eu-west-3a)
│   └── 10.0.2.0/24 (eu-west-3b)
└── Private Subnets (ECS, RDS)
    ├── 10.0.10.0/24 (eu-west-3a)
    └── 10.0.20.0/24 (eu-west-3b)
```

**Pourquoi 2 Availability Zones ?**
- Haute disponibilité : si une AZ tombe, l'autre continue de fonctionner
- Obligatoire pour le RDS Multi-AZ et l'ALB

### CI/CD

```
git push → GitHub Actions → OIDC → AWS
                                    ├── Terraform (infrastructure)
                                    ├── ECR (images Docker)
                                    ├── ECS (déploiement)
                                    ├── S3 (frontend)
                                    └── CloudFront (invalidation cache)
```

**Pourquoi OIDC ?**
- Pas de clés AWS permanentes stockées dans GitHub
- Tokens temporaires (1 heure maximum)
- Trust policy limitée au repository et à la branche `main`

## Security Groups

Le trafic est filtré à chaque niveau :

| Security Group | Ingress | Source |
|---|---|---|
| ALB SG | 80, 443 | Internet (0.0.0.0/0) |
| ECS SG | 3000 | ALB SG uniquement |
| RDS SG | 5432 | ECS SG uniquement |

**Règle d'or** : chaque composant n'accepte que le trafic du composant précédent.

## Fichiers concernés

- `terraform/modules/network/main.tf` — VPC et subnets
- `terraform/modules/security/main.tf` — Security Groups
- `terraform/environments/dev/main.tf` — Composition des modules
- `diagrams/architecture.md` — Diagrammes Mermaid

## Vérification

Après le déploiement, vous pouvez vérifier l'architecture avec :

```bash
# Voir le VPC
aws ec2 describe-vpcs --filters "Name=tag:Project,Values=taskmanager"

# Voir les subnets
aws ec2 describe-subnets --filters "Name=tag:Project,Values=taskmanager"

# Voir les Security Groups
aws ec2 describe-security-groups --filters "Name=tag:Project,Values=taskmanager"
```

## Erreurs fréquentes

| Erreur | Cause | Solution |
|---|---|---|
| ECS tasks can't pull images | NAT Gateway absent ou mal configuré | Vérifier les routes privées → NAT → IGW |
| RDS connection timeout | Security Group RDS n'autorise pas ECS | Vérifier `rds_from_ecs` rule |
| CloudFront 403 | OAC mal configuré ou bucket policy manquante | Vérifier la bucket policy S3 |

---

[Suivant → Network](02-network.md)
