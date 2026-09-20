# Backend — Task Manager API

API REST pour la gestion de tâches, construite avec Node.js, Express, et TypeScript.

## Endpoints

| Méthode | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/tasks` | Lister les tâches |
| GET | `/api/tasks/:id` | Obtenir une tâche |
| POST | `/api/tasks` | Créer une tâche |
| PUT | `/api/tasks/:id` | Modifier une tâche |
| DELETE | `/api/tasks/:id` | Supprimer une tâche |

## Développement local

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t taskmanager-backend .
docker run -p 3000:3000 taskmanager-backend
```

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `PORT` | Port d'écoute | `3000` |
| `NODE_ENV` | Environnement | `development` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base | `appdb` |
| `DB_USERNAME` | Utilisateur DB | `appadmin` |
| `DB_PASSWORD` | Mot de passe DB | — |
| `DB_SECRET_ARN` | ARN Secrets Manager | — |
| `CORS_ORIGIN` | Origine CORS | `*` |
