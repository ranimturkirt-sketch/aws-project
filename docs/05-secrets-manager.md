# Chapitre 5 — Secrets Manager

## Objectif
Gestion sécurisée des credentials de base de données via AWS Secrets Manager. Les secrets sont automatiquement créés par RDS avec manage_master_user_password et injectés dans les containers ECS via le bloc secrets/valueFrom dans la Task Definition.

## Pourquoi ?
Ce composant est essentiel dans l'architecture DevSecOps car il assure la sécurité, la fiabilité et l'automatisation du déploiement.

## Fichiers concernés
- Voir les modules Terraform correspondants dans `terraform/modules/`
- Voir les workflows GitHub Actions dans `.github/workflows/`

## Vérification
Consultez la documentation détaillée dans `docs/html/` pour les commandes de vérification spécifiques.

## Erreurs fréquentes
Voir le chapitre [Troubleshooting](14-troubleshooting.md) pour les erreurs courantes et leurs solutions.

---

[← Précédent](04-rds.md) | [Suivant →](06-ecr.md)
