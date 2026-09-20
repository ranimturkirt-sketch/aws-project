# Chapitre 8 — S3 et CloudFront

## Objectif
Hébergement du frontend React SPA. Bucket S3 privé avec CloudFront comme CDN. Origin Access Control (OAC) pour sécuriser l'accès. Gestion des erreurs 403/404 pour le routing SPA.

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

[← Précédent](07-ecs.md) | [Suivant →](09-github-oidc.md)
