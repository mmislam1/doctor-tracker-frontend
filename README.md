# Doctor Tracker

## Description

Doctor Tracker is an administrator workspace for keeping a doctor directory and its patient records organized, with searchable lists and a dashboard for record totals and recent activity.

## Setup Guide

The frontend and backend are separate repositories in the same parent folder. Use Node.js 26 or newer and npm for both.

### Backend

From a terminal at the project parent folder:

```sh
cd doctor-tracker-backend
npm ci
cp .env.example .env
```

Edit the local `.env` with the required Atlas connection values and a generated Better Auth secret. The example uses `PORT=4000` to match the frontend's development proxy. For local auth, keep `BETTER_AUTH_URL` and `FRONTEND_ORIGIN` set to `http://localhost:3000`.

Start the API in its terminal:

```sh
npm run dev
```

### Frontend

In a second terminal at the project parent folder:

```sh
cd doctor-tracker-frontend
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The local Next.js rewrite sends same-origin `/api/*` requests to `BACKEND_API_ORIGIN`, which defaults to `http://localhost:4000`.

### Environment variables

Backend `.env.example` variables:

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Runtime mode: `development`, `test`, or `production`. |
| `PORT` | HTTP port. The example is `4000` for local frontend proxying; Render supplies its production port. |
| `MONGODB_URI` | MongoDB Atlas connection URI. Replace the username, password, cluster, and database placeholders locally and in Render. |
| `MONGODB_DB_NAME` | MongoDB database name used for application and Better Auth data. |
| `BETTER_AUTH_SECRET` | Random Better Auth server secret of at least 32 characters. Keep it only in backend environment settings. |
| `BETTER_AUTH_URL` | Public origin used by Better Auth. Locally `http://localhost:3000`; in production the exact public Netlify/custom-domain origin. |
| `FRONTEND_ORIGIN` | Exact trusted browser origin. It must match `BETTER_AUTH_URL`. |

Frontend `.env.example` variable:

| Variable | Description |
| --- | --- |
| `BACKEND_API_ORIGIN` | Server-side local development proxy destination, default `http://localhost:4000`. Do not expose it as `NEXT_PUBLIC_*`; production browser traffic uses the Netlify rewrite instead. |

After configuring the backend environment and persistent Atlas database, provision the initial administrator from the backend repository root with the command in the backend README. No public registration page is provided.

## System Architecture

The application is split across two independent Git repositories and deploys as two services:

- `doctor-tracker-frontend` is the Next.js App Router application. It renders the admin interface and uses Redux Toolkit with RTK Query for browser-side REST data and caching.
- `doctor-tracker-backend` is a TypeScript/Express 5 REST API. It owns Better Auth server configuration, session and administrator checks, request validation, and doctor, patient, and dashboard operations.
- MongoDB Atlas stores Better Auth data, doctors, patient profiles, appointments, and Better Auth rate-limit data. Each appointment is a separate document linked to its patient and doctor; profiles can have visits with multiple doctors. The API uses a shared MongoDB client.

The API boundary is the backend's `/api/v1` business routes and `/api/auth/*` Better Auth routes. In the browser, both are requested through relative same-origin paths. In development, `next.config.ts` rewrites `/api/*` to `BACKEND_API_ORIGIN`. In production, Netlify rewrites `/api/*` to the public Render backend URL. Netlify keeps the browser URL on its own origin and proxies the request to Render; Better Auth's host-only session cookie is therefore set for the frontend origin and remains first-party.

Request flow: the browser calls `/api/auth/*` to sign in or check a session, or calls `/api/v1/*` through RTK Query. Netlify forwards `/api/*` to Render in production. Better Auth handles authentication routes; Express checks the session and admin role for business routes, then reads or writes MongoDB Atlas. Patient list responses include appointment records with doctor names and statuses; creating a visit for an existing patient stores another appointment linked to that profile. The JSON response returns through the proxy to the browser, where RTK Query updates the screen and cached data.

## Technical Decisions

### 1. Redux Toolkit and RTK Query for shared application data

The application uses a `makeStore()` factory and a client `StoreProvider`, avoiding a server-wide Redux store in the App Router. Doctor, patient, and dashboard features inject endpoints into one RTK Query API with a same-origin `/api/v1` base URL and credentials enabled. Mutations invalidate doctor, patient, and dashboard cache tags so affected lists and aggregates refresh together. Search, filters, and page numbers live in URL query parameters; form drafts remain local to React Hook Form. This gives the screens one cache for server data instead of copying API responses into Context or additional Redux slices. Logout resets the protected RTK Query cache.

### 2. Separate Next.js and Express repositories with a same-origin API proxy

The Next.js repository contains the browser UI, while the Express repository owns Better Auth, authorization, validation, MongoDB access, and business routes. This keeps database credentials and auth-server secrets out of the frontend build. The browser calls `/api/*` on its own origin; Netlify proxies these requests to Render, and the local Next.js rewrite provides the equivalent path during development. That same-origin flow is used because Better Auth manages an HttpOnly session cookie, which should remain first-party in the browser. The backend still validates the session and admin role on every protected business request; the frontend route guard is only for navigation UX.

## Visual Evidence

Genuine desktop and mobile screenshots of the Dashboard, Doctors, and Patients pages have not been captured, and no screenshot assets are present in this repository. The repository also does not record an accessible deployment URL; the Render target in `netlify.toml` is still a placeholder. No screenshot links are included until the real authenticated pages can be captured.

## Deployment

Deploy in this order:

1. **MongoDB Atlas:** create the Atlas database and database user, configure network access for the Render service, and keep the URI and credentials private.
2. **Render backend:** deploy `doctor-tracker-backend` as a Node web service. Use Node 26, `npm ci` for dependency installation, `npm run build` for the build command, `npm start` for the start command, and `/health` for the health check. Configure `NODE_ENV=production`, `MONGODB_URI`, `MONGODB_DB_NAME`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `FRONTEND_ORIGIN` in Render. `PORT` is supplied by Render. Once the service has connected to the persistent database, create the initial admin using the backend README command.
3. **Netlify frontend:** deploy `doctor-tracker-frontend` with `npm run build` and its managed Next.js runtime. The committed `netlify.toml` rewrites `/api/*` to `https://doctor-tracker-backend-9dje.onrender.com/api/:splat`. Set the backend's `BETTER_AUTH_URL` and `FRONTEND_ORIGIN` to the exact Netlify site or custom-domain origin. The frontend does not need a production `BACKEND_API_ORIGIN`.

The Render URL in the rewrite is public routing configuration, not a secret. MongoDB credentials and `BETTER_AUTH_SECRET` belong only in backend/Render settings. Do not commit `.env`, `.env.local`, administrator passwords, cookies, or session tokens.

## Submission

- **Deployed frontend (Netlify):** [https://doc-trackerx.netlify.app](https://doc-trackerx.netlify.app)
- **Backend (Render):** [https://doctor-tracker-backend-9dje.onrender.com](https://doctor-tracker-backend-9dje.onrender.com)
- **Frontend GitHub repository:** [github.com/mmislam1/doctor-tracker-frontend](https://github.com/mmislam1/doctor-tracker-frontend)
- **Backend GitHub repository:** [github.com/mmislam1/doctor-tracker-backend](https://github.com/mmislam1/doctor-tracker-backend)
