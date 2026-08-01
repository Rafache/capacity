# Ma capacité

Une application web mobile pour calculer sa capacité de travail mensuelle et annuelle.

## Données et confidentialité

- Les saisies restent dans le navigateur, via `localStorage`.
- L’import/export CSV sert de sauvegarde portable.
- Le bouton **Effacer mes données** remet l’application à zéro sur l’appareil utilisé.

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

Chaque mise à jour de la branche `main` est construite et publiée automatiquement sur GitHub Pages par GitHub Actions.