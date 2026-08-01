# Ma capacité

Une application web mobile pour calculer sa capacité de travail mensuelle et annuelle.

## Données et confidentialité

- Aucun compte, cookie, service OpenAI ou serveur n’est utilisé.
- Les saisies restent dans le navigateur, via `localStorage`.
- L’import/export CSV sert de sauvegarde portable.
- Le bouton **Effacer mes données** remet l’application à zéro sur l’appareil utilisé.

Les jours ouvrés sont calculés ainsi : lundi à vendredi, moins les jours fériés. L’année budgétaire 2026–2027 totalise donc 254 jours ouvrés.

## Développement

```bash
npm install
npm run dev
```

Pour vérifier puis construire la version statique :

```bash
npm test
```

## Publication

Chaque mise à jour de la branche `main` est construite et publiée automatiquement sur GitHub Pages par GitHub Actions. Dans les réglages du dépôt, choisissez **Settings → Pages → Build and deployment → GitHub Actions** une seule fois pour l’activer.
