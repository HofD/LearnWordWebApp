# LearnWord Angular App

This directory contains the Angular 17 frontend for LearnWord.

For the repository-level overview, architecture notes, local Docker flow, and license, see `../README.md`.

## Local Development

```bash
npm install
npm start
```

Open:

```text
http://localhost:4200
```

The development build uses the gateway API at:

```text
http://localhost:5100
```

Start the backend and full Docker stack from the sibling backend repository when you need the real gateway, services, database, and Mailpit:

```bash
cd ../../LearnWord
cp deploy/env/local.env.example deploy/env/local.env
./deploy/local-up.sh
```

## Useful Commands

```bash
npm run build
npm test
```

`npm run build` creates the production Angular build under `dist/`. `npm test` runs the Karma/Jasmine unit test suite.

## Source Layout

```text
src/app/
  app.routes.ts             public and authenticated routes
  shared/services/          auth, token storage, alerts, and route guard
  http-interceptors/        bearer-token and refresh-token HTTP behavior
  i18n/                     English and Russian UI strings
  collections/              collection list flow
  collection/               single collection and card flow
  card/                     card editing and AI draft interaction
  review/                   spaced repetition review flow
```

Static SEO files are kept in `src/robots.txt`, `src/sitemap.xml`, and `src/index.html`.

## Behavior Contract

The accepted frontend behavior is documented in:

```text
../../LearnWord/specs/frontend-behavior.md
```

Keep route behavior, API calls, auth handling, localization, and visible states aligned with that spec.
