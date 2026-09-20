# Chapitre 4 — RDS PostgreSQL

## Objectif
Déployer une base de données PostgreSQL managée dans les subnets privés.

## Pourquoi RDS ?
- **Managé** : AWS gère les mises à jour, les backups, le failover
- **Haute disponibilité** : Multi-AZ en production
- **Sécurisé** : Subnets privés, chiffrement, Security Group restrictif
- **Secrets intégrés** : `manage_master_user_password` stocke le mot de passe dans Secrets Manager

## Configuration

| Paramètre | Dev | Prod |
|---|---|---|
| Instance | db.t4g.micro | db.t4g.medium |
| Storage | 20 GB | 50 GB |
| Multi-AZ | Non | Oui |
| Backup | 1 jour | 30 jours |
| Deletion protection | Non | Oui |
| Encryption | Oui | Oui |

## Point clé : manage_master_user_password

```hcl
resource "aws_db_instance" "main" {
  manage_master_user_password = true
  # Le mot de passe est automatiquement :
  # 1. Généré par RDS
  # 2. Stocké dans Secrets Manager
  # 3. Rotatable automatiquement
}
```

**Avantage** : Le mot de passe n'apparaît jamais dans le code Terraform ni dans l'état.

## Vérification

```bash
aws rds describe-db-instances --db-instance-identifier taskmanager-dev-postgres
```

## Erreurs fréquentes

| Erreur | Cause | Solution |
|---|---|---|
| Connection timeout | Security Group | Vérifier que ECS SG est autorisé sur port 5432 |
| `FATAL: database "appdb" does not exist` | DB non créée | Vérifier `db_name` dans Terraform |
| `deletion_protection` | Protection activée | Désactiver avant `terraform destroy` |

---

[← Terraform](03-terraform.md) | [Secrets Manager →](05-secrets-manager.md)
