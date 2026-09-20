# Chapitre 7 — ECS (Elastic Container Service)

## Objectif
Exécution du backend sur Fargate (serverless containers). Task Definition avec secrets injectés depuis Secrets Manager. Service avec ALB attachment et health checks. Auto-scaling optionnel en production.

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

[← Précédent](06-ecr.md) | [Suivant →](08-s3-cloudfront.md)
