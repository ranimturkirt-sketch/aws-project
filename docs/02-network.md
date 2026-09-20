# Chapitre 2 — Network (VPC)

## Objectif
Créer un réseau privé AWS (VPC) pour héberger l'application de manière sécurisée.

## Pourquoi un VPC ?
Un VPC isole nos ressources du reste d'AWS. Sans VPC, nos services seraient exposés dans un réseau partagé. Le VPC nous permet de contrôler exactement quels services sont accessibles depuis Internet et lesquels restent privés.

## Architecture réseau

```
VPC 10.0.0.0/16
├── Public Subnets (accessibles depuis Internet)
│   ├── 10.0.1.0/24 (AZ eu-west-3a) — ALB, NAT Gateway
│   └── 10.0.2.0/24 (AZ eu-west-3b) — ALB
├── Private Subnets (non accessibles depuis Internet)
│   ├── 10.0.10.0/24 (AZ eu-west-3a) — ECS, RDS
│   └── 10.0.20.0/24 (AZ eu-west-3b) — ECS, RDS
├── Internet Gateway — connexion vers Internet
├── NAT Gateway — permet aux subnets privés d'accéder à Internet
└── Route Tables — règles de routage
```

## Fichier
`terraform/modules/network/main.tf`

## Ressources créées

| Ressource | Rôle |
|---|---|
| `aws_vpc` | Réseau privé virtuel |
| `aws_subnet` (public) | Subnets accessibles depuis Internet |
| `aws_subnet` (private) | Subnets isolés (ECS, RDS) |
| `aws_internet_gateway` | Point d'entrée Internet |
| `aws_nat_gateway` | Accès sortant pour subnets privés |
| `aws_eip` | IP statique pour NAT Gateway |
| `aws_route_table` | Tables de routage |
| `aws_route_table_association` | Association subnet ↔ route table |

## Explication des CIDRs

- **10.0.0.0/16** : 65 536 adresses IP disponibles dans le VPC
- **10.0.1.0/24** : 256 adresses pour le subnet public 1
- **10.0.10.0/24** : 256 adresses pour le subnet privé 1
- Les subnets publics et privés sont dans des plages séparées pour plus de lisibilité

## NAT Gateway

**Pourquoi ?** Les tâches ECS dans les subnets privés ont besoin d'accéder à Internet pour :
- Télécharger les images Docker depuis ECR
- Accéder à Secrets Manager
- Envoyer les logs à CloudWatch

**Coût** : ~32 $/mois. En dev, on utilise un seul NAT Gateway (au lieu de 2 en prod).

## Vérification

```bash
aws ec2 describe-vpcs --filters "Name=tag:Project,Values=taskmanager" --query 'Vpcs[].{ID:VpcId,CIDR:CidrBlock}'
aws ec2 describe-subnets --filters "Name=tag:Project,Values=taskmanager" --query 'Subnets[].{ID:SubnetId,CIDR:CidrBlock,AZ:AvailabilityZone,Type:Tags[?Key==`Type`].Value|[0]}'
```

## Erreurs fréquentes

| Erreur | Cause | Solution |
|---|---|---|
| `InvalidSubnet` | CIDR chevauche un autre subnet | Vérifier les plages CIDR |
| ECS ne pull pas les images | Route privée → NAT manquante | Vérifier route table privée |
| Timeout connexion RDS | RDS dans subnet public | Vérifier que RDS est en subnet privé |

---

[← Architecture](01-architecture.md) | [Terraform →](03-terraform.md)
