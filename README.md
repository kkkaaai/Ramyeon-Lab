# Ramyeon Labs 🍜

A pixel-art coworking community platform for London builders. One ramyeon machine, many founders.

- **`/`** — Landing page with hero, upcoming sessions, community projects, researchers, news, recipes
- **`/members`** — Researcher directory (auth required)
- **`/projects`** — Community project showcase
- **`/events`** — Upcoming and past sessions
- **`/queue`** — Big-screen queue display (designed for a TV at the event)
- **`/queue/join`** — Members join/leave the queue
- **`/join`** — Public signup (anyone can create a profile)
- **`/admin`** — Host dashboard (password-gated)

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS with custom pixel tokens
- Supabase (Postgres + Auth + Storage + Realtime)
- Vercel deployment

## 1. Install

```bash
pnpm install      # or npm / yarn
```

## 2. Supabase setup

1. Create a new Supabase project at https://supabase.com.
2. In the SQL editor, run the contents of **`supabase/schema.sql`**. This creates all tables, RLS policies, storage buckets, and adds realtime.
3. Then run **`supabase/seed.sql`** to insert 2 starter announcements so the homepage Latest News section isn't empty on day one. You can edit/add rows in this file (or directly in the Supabase dashboard) to manage announcements until the admin UI lands.
4. In **Authentication → Providers → Email**, disable "Confirm email" if you want users to skip email verification during the event (optional, makes signup instant).
5. Copy these values from **Project Settings → API**:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET=your-admin-password    # login at /admin/login
```

## 4. Run locally

```bash
pnpm dev
```

Open http://localhost:3000.

## 5. Add hero assets

Drop a pixel-art hero image at `public/hero.jpg` and a circular logo badge at `public/logo-badge.png` (the nav currently shows a text "RL" placeholder if no image — you can swap the centered `<Link>` in `app/components/nav/TopNav.tsx` to an `<Image>` once you have the file).

## 6. First run flow

1. Go to `/admin/login`, enter your `ADMIN_SECRET`.
2. In the **SESSION** tab, create & activate your first session (e.g. "Sunday 13 April").
3. Share `/join` — anyone can sign up and create a profile.
4. On the day, display `/queue` on a TV (click FULLSCREEN).
5. Members go to `/queue/join` on their phones and hit the big button.
6. In `/admin` → **QUEUE** tab, mark people as cooking / done as they go.

## 7. Deploy to Vercel

```bash
vercel
```

Add all 5 environment variables in the Vercel project settings. Push to main to deploy.

## Architecture notes

- All Supabase DB logic lives in `app/lib/supabase/` — components only import helpers from `queries.ts` or the typed clients.
- `/admin` and `/api/admin/*` are gated by an httpOnly signed cookie set by `/api/admin/auth` — see `middleware.ts`.
- Realtime on `/queue` subscribes to both `queue_entries` and `sessions` so the big screen updates instantly.
- Queue position assignment happens server-side in `/api/queue/join` (service role) to avoid race conditions.
- Server components by default; client components only for interactivity (forms, modals, realtime subscriptions).

## Known follow-ups

- Admin UI for announcements (currently managed via `supabase/seed.sql`)
- Drag-to-reorder in the admin queue tab (currently up/down arrows)
- Richer profile modal with researcher's projects
