# Chapitre 11 — Security Scanning

## Objectif
5 niveaux de scan : Gitleaks (secrets), CodeQL (code statique), Trivy FS (dépendances), Trivy IaC (Terraform), Trivy Image (Docker). Pipeline bloquée si vulnérabilités HIGH/CRITICAL détectées.

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

[← Précédent](10-github-actions.md) | [Suivant →](12-deployment.md)
