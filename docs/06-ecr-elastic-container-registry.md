# Chapitre 6 — ECR (Elastic Container Registry)

## Objectif
Registry Docker privé pour stocker les images du backend. Tags IMMUTABLE basés sur le Git SHA. Scan on push activé. Lifecycle policy pour garder les 20 dernières images.

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

[← Précédent](05-secrets-manager.md) | [Suivant →](07-ecs.md)
