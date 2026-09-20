# Frontend — Task Manager

Interface utilisateur pour la gestion de tâches, construite avec React, Vite, et TypeScript.

## Fonctionnalités

- ✅ Afficher les tâches
- ✅ Créer une tâche
- ✅ Modifier une tâche (titre, description)
- ✅ Toggle complété/non complété
- ✅ Supprimer une tâche
- ✅ Filtres (toutes, en cours, terminées)
- ✅ Design moderne (dark mode, glassmorphism)
- ✅ Responsive

## Développement local

```bash
npm ci
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

Le proxy Vite redirige `/api` vers `http://localhost:3000` (backend).

## Build

```bash
npm run build
```

Les fichiers statiques sont générés dans `dist/`.

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `VITE_API_URL` | URL de l'API backend | `/api` (proxy) |
