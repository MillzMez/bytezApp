# Architecture

This document describes how the Bytez codebase is organized and
how the pieces fit together.

_Last updated: 2026-06-09_

## Monorepo structure

Bytez is an **npm-workspaces monorepo**. Both deployable
applications live under `packages/`, and a single `npm install`
at the root installs dependencies for every workspace.

```text
bytezApp/
├── package.json            # workspace root; dev/format/lint scripts
├── .prettierrc             # shared formatting rules
├── .github/workflows/      # CI + Azure deployment pipelines
├── docs/                   # project documentation (this folder)
└── packages/
    ├── react-frontend/     # React + Vite single-page app
    └── express-backend/    # Express REST API + Mongoose models
```

The root `package.json` wires the workspaces together:

| Script             | What it does                       |
| ------------------ | ---------------------------------- |
| `npm run dev`      | runs frontend and backend together |
| `npm run frontend` | Vite dev server only               |
| `npm run backend`  | Express + nodemon only             |
| `npm run format`   | Prettier write across the repo     |
| `npm run lint`     | Prettier check (run in CI)         |

## Frontend package (`packages/react-frontend`)

A Vite single-page app. State lives in the top-level `MyApp`
component, which owns auth, the restaurant list, and all
per-user data, and passes handlers down to presentational
components.

| Module                       | Responsibility                              |
| ---------------------------- | ------------------------------------------- |
| `src/MyApp.jsx`              | App state, auth, and all backend calls      |
| `src/LoginPage.jsx`          | Login / signup form                         |
| `src/Header.jsx`             | Title, favorites filter toggle, logout      |
| `src/FilterSidebar.jsx`      | Cuisine / price / occasion / rating filters |
| `src/MoodSidebar.jsx`        | Mood filter (right rail)                    |
| `src/RestaurantList.jsx`     | Table, per-row mood/notes modals            |
| `src/AddRestaurantModal.jsx` | Form to create a restaurant                 |
| `src/RandomPickModal.jsx`    | Random restaurant picker                    |
| `src/Toast.jsx`              | Transient status messages                   |
| `src/restaurantAdapter.js`   | Maps backend documents to UI shape          |

The frontend talks to the backend over `fetch`, attaching the
JWT as a `Bearer` token. The API base URL is the `API_PREFIX`
constant in `MyApp.jsx`.

## Backend package (`packages/express-backend`)

An Express REST API following an MVC-style layering: route
handlers are thin and delegate to a service layer, which is the
only code that touches the database through Mongoose models.

| Module                           | Responsibility                      |
| -------------------------------- | ----------------------------------- |
| `backend.js`                     | Express app, route definitions      |
| `auth.js`                        | JWT creation + auth middleware      |
| `models/restaurants.js`          | Restaurant schema                   |
| `models/users.js`                | User schema + note/mood sub-schemas |
| `services/restaurant-service.js` | Restaurant queries and mutations    |
| `services/user-service.js`       | User, favorites, notes, moods logic |

### Layering

```text
HTTP request
   │
   ▼
backend.js (route handler)  ── authenticateUser middleware (auth.js)
   │
   ▼
services/*-service.js  (business logic, the only DB-aware layer)
   │
   ▼
models/*.js (Mongoose schemas)  ──►  MongoDB Atlas
```

Keeping the database logic in the service modules is what makes
the backend unit-testable: the services can be tested directly
without spinning up the Express routes.

## Request flow example: favoriting a restaurant

1. User clicks the heart in `RestaurantList`.
2. `MyApp.toggleFavorite` optimistically updates local state and
   sends `POST /users/me/favorites/:restaurantId` with the JWT.
3. `authenticateUser` verifies the token and sets `req.user`.
4. The route calls `userService.addFavoriteRestaurant`.
5. Mongoose updates the user document; the response confirms the
   change (the UI reverts its optimistic update on failure).

## CI/CD

GitHub Actions workflows in `.github/workflows/` run a Prettier
check on every push to `main` and deploy the frontend and
backend to Azure Web Apps.
