# EXYT Client Knowledge Base

A Next.js 14 dashboard with a Supabase-backed client database and an Anthropic
Claude–powered chatbot that answers analytical questions about the client base
(averages, distributions, geographic coverage, revenue per employee, and so on).

## Stack

- Next.js 14 (App Router, TypeScript, server components by default)
- Tailwind CSS + shadcn/ui-style primitives (Radix + cmdk)
- Supabase (Postgres + RLS)
- Vercel AI SDK + `@ai-sdk/anthropic` — model: `claude-sonnet-4-6`
- Deployed on Vercel

## Project structure

```
/app
  /api
    /chat/route.ts        streaming chat endpoint (POST)
    /clients/route.ts     GET (list) + POST (insert)
  layout.tsx
  page.tsx                main dashboard (server component)
/components
  Dashboard.tsx           client wrapper that holds layout state
  ClientsTable.tsx        read-only list with row expand for notes/description
  AddClientModal.tsx      form modal triggered by + Add Client
  StatesMultiSelect.tsx   searchable multi-select with chips
  ChatPanel.tsx           streaming chat UI
  /ui                     shadcn-style primitives
/lib
  supabase-server.ts      service-role client (server only)
  supabase-browser.ts     anon client (browser only)
  anthropic.ts            Anthropic AI SDK setup
  states.ts               US states constant (50 + DC)
  validators.ts           Zod schemas
  format.ts               currency/number/date formatters
  utils.ts                cn() helper
/supabase
  schema.sql              run this in the Supabase SQL editor
/types
  database.ts             generated Supabase types (typed by hand here)
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project and run the schema

1. Create a new project at https://supabase.com/dashboard.
2. Open the SQL Editor and paste the contents of `supabase/schema.sql`. Run it.
3. From **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only — never
     expose this to the browser)

### 3. Get an Anthropic API key

Create one at https://console.anthropic.com → `ANTHROPIC_API_KEY`.

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
```

### 5. (Optional) Regenerate Supabase types

The committed `types/database.ts` matches the schema. If you change the schema,
regenerate it with the Supabase CLI:

```bash
npx supabase gen types typescript --project-id <PROJECT_REF> > types/database.ts
```

### 6. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Verify the build

```bash
npm run typecheck   # tsc --noEmit
npm run build       # next build
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in https://vercel.com/new.
3. Set the four environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ANTHROPIC_API_KEY`) in the Vercel project settings.
4. Deploy. The `app/api/chat/route.ts` and `app/api/clients/route.ts` handlers
   run on the Node.js runtime.

## Scope notes

This is v1. Out of scope:

- Auth — RLS policies are intentionally permissive (`using (true)`). Tighten
  before production.
- Editing or deleting clients — the UI is insert/read-only.
- File uploads, realtime, pagination (assumes < 500 clients).
