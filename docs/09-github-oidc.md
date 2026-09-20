# Chapitre 9 — GitHub OIDC

## Objectif
Authentification sécurisée entre GitHub Actions et AWS via OpenID Connect. Aucune clé AWS permanente. Trust policy limitée au repository et à la branche main. Deux rôles : terraform (infrastructure) et deploy (déploiement).

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

[← Précédent](08-s3-cloudfront.md) | [Suivant →](10-github-actions.md)
