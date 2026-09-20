# Chapitre 13 — Monitoring

## Objectif
CloudWatch Logs pour les logs applicatifs ECS. Rétention 30 jours. Alarmes optionnelles : CPU ECS > 80%, erreurs 5xx ALB > 10. Container Insights pour métriques détaillées.

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

[← Précédent](12-deployment.md) | [Suivant →](14-troubleshooting.md)
