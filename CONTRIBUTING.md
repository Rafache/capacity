# Contribuer

L’application est volontairement simple : elle fonctionne entièrement dans le navigateur et est publiée automatiquement sur GitHub Pages.

## Pré-requis

- Node.js en version LTS récente
- npm

## Installer et lancer le projet

```bash
git clone https://github.com/Rafache/capacity.git
cd capacity
npm install
npm run dev
```

## Vérifier une modification

Avant de proposer une contribution, lancez :

```bash
npm test
```

Cette commande vérifie le typage, construit l’application statique et exécute les tests métier. En particulier, l’année budgétaire 2026–2027 doit conserver **254 jours ouvrés**.

Testez également, dans le navigateur :

- la saisie mensuelle, y compris les demi-journées ;
- les vues mensuelle et annuelle ;
- la persistance après rechargement ;
- l’import et l’export CSV ;
- le rendu sur un écran mobile.

## Organisation du code

- `src/views/` : écrans mensuel et annuel ;
- `src/components/` : composants réutilisables ;
- `src/capacity.ts` : règles de calcul ;
- `src/data/schoolBreaks.ts` : vacances scolaires ;
- `src/types.ts` : types partagés ;
- `src/styles.css` : styles de l’application.

Gardez les changements ciblés : évitez les dépendances et les refontes non nécessaires.

## Proposer une modification

1. Créez une branche descriptive depuis `main`, par exemple `fix/csv-import` ou `feature/school-breaks-2027`.
2. Réalisez une modification limitée à un objectif clair.
3. Lancez `npm test`.
4. Ouvrez une pull request vers `main` en expliquant :
   - le besoin traité ;
   - les changements apportés ;
   - les vérifications effectuées ;
   - l’incidence éventuelle sur les données locales ou le CSV.

N’incluez jamais de données personnelles, d’exports CSV d’utilisateurs ou de clés dans le dépôt.

## Publication

Chaque mise à jour fusionnée dans `main` est construite et publiée automatiquement sur GitHub Pages. Vérifiez que le workflow GitHub Actions est terminé avec succès après la fusion.
