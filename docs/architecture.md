# Architecture

## Runtime flow

The browser loads the static Vite bundle. `useCapacityStore` reads and validates `localStorage` once, then writes normalized data after each explicit user action. React derives the selected fiscal-year model from the store and passes ready-to-display statistics to the views.

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

- `domain/calendar.ts` is the single source for fiscal-month mapping, public holidays, working days and half-day rounding.
- `domain/capacityData.ts` normalizes entries, caps absences at contracted capacity, calculates monthly statistics and produces the annual summary in one pass.
- `domain/csv.ts` owns the versioned CSV format, strict parsing and the French version 2 compatibility path.
- `data/schoolBreaks.ts` stores school breaks by stable English key. Common periods are stored once, zone-specific periods override them, and `validateSchoolCalendars()` checks dates, zones, coverage and overlaps.

The fiscal year starts on 1 July and ends on 30 June. The calendar scope is metropolitan France, national public holidays and school zones A, B and C. Local Alsace-Moselle and overseas rules are outside the current scope.

## Internationalization

`src/i18n/fr.ts` is the reference catalogue and satisfies `TranslationCatalog` at compile time. Components use the typed `t` catalogue instead of embedding user-facing French text. Domain identifiers remain English and are therefore independent from translations. `formatters.ts` caches `Intl.NumberFormat` and `Intl.DateTimeFormat` instances for the active locale and UTC date handling.

Adding another language means implementing the same `TranslationCatalog` shape without changing domain data or calculations.

## Persistence and compatibility

The current storage key is `ma-capacite-v3`. Reads accept v1/v2 keys and arbitrary unknown input, then produce a complete v3 document. Invalid years, zones, entries, numbers and absence totals are repaired before rendering. Writes serialize only normalized data. A storage or quota failure is reported in the UI and does not prevent the current in-memory session from working.

The CSV export uses stable English columns and a version marker. The importer accepts v3 and the previous French v2 format, including quoted multiline fields, but never stores the legacy free-text note.

## Security

The application has no backend and keeps user data in clear text in the browser. `public/_headers` adds a restrictive CSP, frame protection, MIME sniffing protection, referrer and permissions policies, and explicit cache behavior. Inline scripts are not allowed. `CapacityBar` uses a small inline width style for data-driven geometry, so the CSP keeps the minimum `unsafe-inline` exception for styles; no inline JavaScript is permitted.

The custom service worker was removed to prevent stale application bundles. The manifest remains so users can install the application, but offline caching is not promised.

## Build and deployment

Cloudflare Pages builds the repository with the pinned Node version from `.node-version`, runs `npm ci` and publishes the Vite `dist` directory. `main` is the production deployment and pull-request branches receive previews. The CI workflow runs lint, type checks, tests, the production build and an asset-path assertion.
