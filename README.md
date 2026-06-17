# Internship Launchpad

Internship Launchpad is a full-stack internship tracking and career preparation app for students. It lets you manage applications, protect each user's data with Supabase Auth and Row Level Security (RLS), and use Claude to turn a job description into skill gaps and mock interview questions.

## What is implemented

### Authentication and authorization

- Supabase Auth handles sign in, sign up, session persistence, and sign out
- Express validates Supabase JSON Web Tokens (JWTs) on protected routes
- Server-side Supabase clients forward the user's JWT so RLS enforces row ownership
- Protected client routes keep signed-out visitors on the login page

### Application tracking

- Create applications with company, role, status, deadline, and notes
- View all saved applications for the signed-in user
- Update application status from the application list
- Delete applications
- Store data in Supabase Postgres with RLS policies

### Dashboard

- Show total applications
- Count applications by status
- Show upcoming deadlines
- Render loading and empty states

### AI job analysis

- Paste a job description into the analysis page
- Call the Express API, which keeps the Anthropic key on the server
- Generate skill gaps with importance levels and learning suggestions
- Generate technical, behavioral, and role-specific mock interview questions
- Limit output size to reduce Claude token usage

### AI cost controls

- Server-side kill switch with `AI_ENABLED`
- Optional demo allowlist with `AI_ALLOWED_EMAILS`
- Per-user cooldown, hourly limit, and daily limit before paid Claude calls
- Job-description character cap before paid Claude calls
- Per-user cache for repeated job descriptions
- Usage logging with estimated and actual token counts
- Client-side character counter and quota-aware error messages
- Focused server tests for validation, cache keys, cooldowns, and quota math

## What is not implemented yet

- Broader automated test coverage for the API and client
- Pagination or filtering for large application lists
- Interview conversion-rate analytics
- Skill development goal tracking
- Profile/onboarding API and UI
- Personalized profile-aware AI analysis
- Full study roadmaps or broader career insight reports
- Resume upload, resume parsing, or profile prefill from a resume

## Tech stack

### Client

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS v4
- Supabase browser client

### Server

- Node.js
- Express 5
- TypeScript
- Supabase JavaScript client
- Anthropic SDK
- Node test runner with `tsx`

### Data and AI

- Supabase Postgres
- Supabase Auth
- Supabase RLS
- Claude through the Anthropic API

## Project structure

```text
client/
  vercel.json      Vercel SPA rewrite config
  src/
    components/     navigation, route guards, and application UI
    context/        auth session state
    hooks/          application data hooks
    lib/            API and Supabase clients
    pages/          login, dashboard, applications, analysis
    types/          shared client-side TypeScript types

server/
  db/               Supabase SQL schema files
  src/
    config/         environment, Supabase, and Anthropic clients
    controllers/    application and AI handlers
    middleware/     Supabase JWT auth middleware
    routes/         Express route modules
    services/       Supabase-backed AI usage and cache helpers
    types/          server-side TypeScript types
    utils/          testable AI cost-control logic
  tests/            focused server tests
```

## Local setup

### 1. Install dependencies

```powershell
cd client
npm install
```

```powershell
cd server
npm install
```

### 2. Configure environment variables

Create `client/.env.local` from `client/.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_API_URL=http://localhost:3001
VITE_AI_MAX_JOB_DESCRIPTION_CHARS=8000
```

Create `server/.env` from `server/.env.example`:

```env
PORT=3001
CLIENT_ORIGINS=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
ANTHROPIC_API_KEY=your_anthropic_api_key_here

AI_ENABLED=true
AI_ALLOWED_EMAILS=
AI_DAILY_USER_LIMIT=5
AI_HOURLY_USER_LIMIT=2
AI_COOLDOWN_SECONDS=30
AI_MAX_JOB_DESCRIPTION_CHARS=8000
AI_MAX_OUTPUT_TOKENS=900
AI_CACHE_TTL_HOURS=168
```

The server intentionally uses the Supabase publishable key. It validates the user's JWT and runs database queries as that user, so RLS remains the authorization boundary.

`CLIENT_ORIGINS` is a comma-separated exact allowlist. Do not use `*` in production.

### 3. Create the database tables

Run these files in the Supabase SQL editor:

```text
server/db/schema.sql
server/db/ai_usage.sql
```

`schema.sql` creates the `applications` table and RLS policies. `ai_usage.sql` creates the AI usage log, AI analysis cache, and related RLS policies.

### 4. Start the development servers

Start the API server:

```powershell
cd server
npm run dev
```

Start the client:

```powershell
cd client
npm run dev
```

The client runs at `http://localhost:5173`. The API runs at `http://localhost:3001`.

## Useful commands

```powershell
cd server
npm test
npm run build
```

```powershell
cd client
npm run build
```

## API routes

### Public routes

- `GET /health`

### Protected routes

These routes require `Authorization: Bearer <supabase_access_token>`:

- `GET /api/applications`
- `POST /api/applications`
- `GET /api/applications/:id`
- `PATCH /api/applications/:id`
- `DELETE /api/applications/:id`
- `POST /api/ai/analyze`

## Deployment

This app deploys as three pieces:

- Frontend: Vercel, rooted at `client/`
- Backend: Vercel Express project, rooted at `server/`
- Database/auth: Supabase

This guide uses Vercel for the backend because the Hobby plan is the cleanest zero-dollar path for this small Express API. The server still has `npm start`, so it can also run on a long-lived Node host later.

### 1. Supabase

Run these SQL files in the Supabase SQL editor before deploying:

```text
server/db/schema.sql
server/db/ai_usage.sql
```

In Supabase Auth settings, add the deployed frontend Vercel URL to the allowed site/redirect URLs.

### 2. Vercel backend

Create a Vercel project from the GitHub repository and use these settings:

```text
Root directory: server
Framework preset: Express, or Other if Express is not shown
Build command: npm run build
```

Set these backend environment variables in Vercel:

```env
CLIENT_ORIGINS=https://your-frontend-vercel-app.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
ANTHROPIC_API_KEY=your_anthropic_api_key_here

AI_ENABLED=true
AI_ALLOWED_EMAILS=your@email.com
AI_DAILY_USER_LIMIT=5
AI_HOURLY_USER_LIMIT=2
AI_COOLDOWN_SECONDS=30
AI_MAX_JOB_DESCRIPTION_CHARS=8000
AI_MAX_OUTPUT_TOKENS=900
AI_CACHE_TTL_HOURS=168
```

Keep `AI_ALLOWED_EMAILS` set while demoing if you only want trusted accounts to spend Claude credits. Leave it blank only when you are ready for every signed-in user to access AI analysis.

Do not add any variable with a `VITE_` prefix to the backend unless the server code explicitly needs it.

### 3. Vercel frontend

Create a Vercel project from the same GitHub repository and use these settings:

```text
Root directory: client
Framework preset: Vite
Build command: npm run build
Output directory: dist
```

Set only public Vite environment variables in Vercel:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_API_URL=https://your-backend-vercel-app.vercel.app
VITE_AI_MAX_JOB_DESCRIPTION_CHARS=8000
```

Do not add `ANTHROPIC_API_KEY` or any Supabase service-role key to the frontend Vercel project. Any `VITE_` value is bundled into the browser app.

### 4. Final production wiring

After both services deploy:

1. Copy the backend Vercel URL into the frontend project as `VITE_API_URL`.
2. Copy the frontend Vercel URL into the backend project as `CLIENT_ORIGINS`.
3. Redeploy both services so the new environment variables take effect.
4. Sign in, add an application, and run one AI analysis from the deployed frontend.

## Author

Dev Goswami

- Portfolio: https://builtbyd3v.com
- LinkedIn: https://linkedin.com/in/builtbydev
