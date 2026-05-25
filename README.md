# LearnWord Web App

[![Frontend CI](https://github.com/HofD/LearnWordWebApp/actions/workflows/frontend-ci.yml/badge.svg?branch=main)](https://github.com/HofD/LearnWordWebApp/actions/workflows/frontend-ci.yml)

LearnWord Web App is the Angular frontend for LearnWord, a fullstack language-learning application used as a sandbox for experimenting with a spec-driven, agent-assisted software delivery workflow.

The frontend lets users register, confirm email, log in, manage word collections, create cards with words and translations, generate draft cards with AI through the backend, and review due cards with spaced repetition. The portfolio value of the project is broader than the UI itself: it demonstrates how a frontend can stay aligned with explicit behavior specs, backend API contracts, Docker-first verification, and role-specific AI agent work.

## Live Demo

Try the published application: **[learnword.online](https://learnword.online)**

Key scenario:
1. Register and confirm email.
2. Create a collection.
3. Paste source text into AI Card Generator.
4. Review generated card suggestions.
5. Save selected cards and practice them through spaced repetition.

## Highlights

- Angular 17 standalone-component application.
- Public home and about pages with localized English and Russian content.
- Registration, email confirmation, login, password recovery, refresh-token handling, and logout flows.
- Authenticated collection, card, word, AI draft generation, and review screens.
- Session-storage token handling with an HTTP interceptor for bearer tokens and refresh retries.
- SEO metadata, `robots.txt`, and `sitemap.xml` for public routes.
- Docker-ready production build served by nginx.
- Frontend behavior tracked in the sibling backend repository specs.

## Portfolio Case

LearnWord is positioned as:

> A fullstack product sandbox for building and testing an agent-assisted SDLC workflow.

This repository shows the frontend side of that workflow. The core loop is:

1. Capture UI requirements and acceptance criteria.
2. Keep frontend behavior aligned with the shared specs.
3. Route bounded implementation work to the frontend UI agent when useful.
4. Verify changes through Angular builds, Docker startup, and browser checks.
5. Record significant delivery work in the backend repository's `agent-runs/` artifacts.

## Related Backend Documentation

The broader architecture and agent-assisted delivery workflow are documented in the backend repository:

- [Backend repository](https://github.com/HofD/LearnWord)
- [Architecture](https://github.com/HofD/LearnWord/blob/main/docs/architecture.md)
- [Agentic SDLC workflow](https://github.com/HofD/LearnWord/blob/main/docs/agentic-sdlc.md)
- [AI features](https://github.com/HofD/LearnWord/blob/main/docs/ai-features.md)
- [Demo scenarios](https://github.com/HofD/LearnWord/blob/main/docs/demo-scenarios.md)
- [Recorded agent runs](https://github.com/HofD/LearnWord/tree/main/agent-runs)

## Repository Layout

```text
LearnWordWebApp/
  README.md                  frontend repository overview
  LICENSE                    non-commercial source-available license
  lw-app/                    Angular application
    src/app/                 routes, components, services, guards, and UI logic
    src/environments/        development and production API URLs
    src/robots.txt           crawler rules for the built app
    src/sitemap.xml          public route sitemap
    Dockerfile               production frontend image
    nginx.conf               static hosting and SPA fallback config
```

The .NET backend, gateway, deployment scripts, specs, and agent workflow docs live in the sibling repository:

[Backend repository](https://github.com/HofD/LearnWord)

## Architecture

At a high level:

```text
Angular frontend
      |
      v
Ocelot gateway
      |
      +--> IdentityService.WebApi
      |
      +--> LearnWord.Identity
                |
                v
          LearnWord.WebApi
                |
                v
            PostgreSQL
```

The frontend calls the public gateway through `/api/...` endpoints. Development uses `http://localhost:5100`; production uses `https://learnword.online`.

## Frontend Behavior

Current behavior is documented in the shared
[frontend behavior specification](https://github.com/HofD/LearnWord/blob/main/specs/frontend-behavior.md).

Important routes:

- `/` public home page.
- `/register`, `/login`, `/forgot-password`, `/reset-password`, `/confirm` for account flows.
- `/collections`, `/collections/:id`, and `/review/:collectionId` for authenticated learning flows.
- `/about` public product page.

The app supports English and Russian UI localization. User-created learning content is displayed as entered and is not translated by the interface layer.

## Local Run

From this repository root:

```bash
cd lw-app
npm install
npm start
```

Open:

```text
http://localhost:4200
```

The development frontend expects the backend gateway at:

```text
http://localhost:5100
```

For the full local stack, use the sibling backend repository. If you are still in `lw-app/`, run:

```bash
cd ../../LearnWord
cp deploy/env/local.env.example deploy/env/local.env
./deploy/local-up.sh
```

Docker local endpoints:

- frontend: `http://localhost:8088`
- gateway: `http://localhost:5100`
- Mailpit inbox: `http://localhost:8025`

## Verification

Focused frontend checks from `lw-app/`:

```bash
npm run build
npm test
```

Preferred full-stack verification from the sibling backend repository. If you are still in `lw-app/`, run:

```bash
cd ../../LearnWord
./deploy/local-up.sh
```

Use browser checks against `http://localhost:8088` after UI changes when the Docker stack is available.

## Project Guidance

- Treat the [frontend behavior specification](https://github.com/HofD/LearnWord/blob/main/specs/frontend-behavior.md) as the source of truth for accepted frontend behavior.
- Keep API URL, DTO, auth, and validation behavior aligned with the [backend API specification](https://github.com/HofD/LearnWord/blob/main/specs/backend-api.md).
- Start cross-domain or ambiguous work with the [System Analyst agent](https://github.com/HofD/LearnWord/blob/main/agents/system-analyst/AGENT.md).
- Frontend-specific implementation work is owned by the [Frontend UI agent](https://github.com/HofD/LearnWord/blob/main/agents/frontend-ui/AGENT.md).

## License

This repository is source-available for non-commercial use only. See [LICENSE](LICENSE).
