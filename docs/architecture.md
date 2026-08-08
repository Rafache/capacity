# Architecture

## Runtime flow

The browser loads the static Vite bundle. `useCapacityStore` reads `localStorage` once, then writes data after each explicit user action. React derives the selected fiscal-year model from the store and passes ready-to-display statistics to the views.

```text
localStorage -> storage boundary -> CapacityData
                                      |
                                      v
                         fiscal-year calculation
                                      |
                                      v
                         monthly / annual views
```

There is no server, authentication layer or remote data request.

## Domain

- `domain/calendar.ts` maps fiscal months and calculates public holidays and working days.
- `domain/capacity.ts` normalizes entries, caps absences and calculates monthly and annual statistics.
- `domain/storage.ts` loads, migrates and saves browser data without exposing storage failures to React.
- `domain/csv.ts` owns the current CSV export and import format.
- `data/schoolBreaks.ts` stores published school breaks with common and zone-specific periods.

The fiscal year starts on 1 July and ends on 30 June. The calendar scope is metropolitan France, national public holidays and school zones A, B and C. Local Alsace-Moselle and overseas rules are outside the current scope.

## French labels

`src/i18n/fr.ts` contains all user-facing French text. Domain identifiers remain English and independent from labels. `formatters.ts` creates the few shared `Intl` formatters once and handles dates in UTC.

## Persistence and compatibility

The current storage key is `ma-capacite-v3`. Reads still accept v1/v2 keys and normalize entries into a complete v3 document. Invalid stored content is ignored safely. A storage or quota failure is reported in the UI and does not prevent the current in-memory session from working.

The CSV export uses stable English columns and a version marker. The importer accepts only the current v3 format produced by the application. Older local browser data is migrated, but older CSV exports are not.

## Security

The application has no backend and keeps user data in clear text in the browser. `public/_headers` adds a restrictive CSP, frame protection, MIME sniffing protection, referrer and permissions policies, and explicit cache behavior. Inline scripts are not allowed. Capacity bars use inline dimensions for data-driven geometry, so the CSP permits inline styles; no inline JavaScript is permitted.

The manifest remains so users can install the application, but offline caching is not provided.

## Build and deployment

Cloudflare Pages builds the repository with the pinned Node version from `.node-version`, runs `npm ci` and publishes the Vite `dist` directory. `main` is the production deployment and pull-request branches receive previews. CI runs formatting, lint, one TypeScript check, focused tests, the production build and an asset-path assertion.
