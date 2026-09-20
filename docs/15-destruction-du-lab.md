# Chapitre 15 — Destruction du LAB

## Objectif
Procédure complète pour nettoyer l'environnement : vider S3, supprimer images ECR, désactiver deletion protection RDS, terraform destroy, nettoyer le bootstrap. Ordre de destruction important pour éviter les erreurs de dépendances.

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

[← Précédent](14-troubleshooting.md)
