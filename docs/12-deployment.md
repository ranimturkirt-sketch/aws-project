# Chapitre 12 — Deployment

## Objectif
Processus de déploiement complet : Bootstrap Terraform → Infrastructure → Premier push ECR → Configuration GitHub Variables → git push → Déploiement automatique backend/frontend.

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

[← Précédent](11-security.md) | [Suivant →](13-monitoring.md)
