# Workflow Capture — Project Notes

Durable context for future Claude Code sessions. Keep this file updated as the project evolves.

---

## What this app is

An internal Six Peak Capital tool for capturing how team members actually do recurring work. People (Assistant PMs, ops, etc.) log the multi-step workflows they perform so SPC can:

- See the full set of workflows running across the team
- Identify handoffs and time sinks
- Surface automation / consolidation opportunities

It's a lightweight form + dashboard, not a task manager.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2.3 (App Router, React 19, "use client" components) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| Fonts | Geist + Geist Mono (next/font/google) |
| Backend | Supabase (Postgres + auto REST), `@supabase/supabase-js` ^2.103 |
| TypeScript | ^5 |
| Hosting | Not yet deployed (Vercel is the obvious target) |

No auth yet — form is open to anyone who has the URL.

---

## Routes

| Path | File | Purpose |
|------|------|---------|
| `/` | `app/page.tsx` | Form for logging a workflow (multi-step) |
| `/dashboard` | `app/dashboard/page.tsx` | List of all submitted workflows with expandable step view |

Shared `app/layout.tsx` provides top nav with "Log Task" + "Dashboard" links and sets metadata title `"Workflow Capture - Six Peak Capital"`.

---

## Data model (Supabase)

**Project ref:** `nmhckgzfbqetcnandyfz`
**Dashboard:** https://supabase.com/dashboard/project/nmhckgzfbqetcnandyfz
**API URL:** https://nmhckgzfbqetcnandyfz.supabase.co

Two tables, one-to-many. Verified live against the Supabase schema on Apr 16, 2026.

### `workflows`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `workflow_name` | text | NO | — | e.g. "Subcontractor Invoice Review & Coding" |
| `submitted_by` | text | NO | — | Person's name |
| `role` | text | YES | — | Position (added Apr 16 to match code) |
| `frequency` | text | YES | — | One of: Daily, Weekly, Monthly, As Needed |
| `responsible_parties` | text | YES | — | Everyone involved in this workflow (added Apr 19) |
| `critical_assumptions` | text | YES | — | Preconditions for workflow to begin (added Apr 19) |
| `created_at` | timestamptz | YES | `now()` | — |

### `workflow_steps`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `workflow_id` | uuid | NO | — | FK → `workflows(id)` ON DELETE CASCADE |
| `step_number` | int | NO | — | 1-indexed, assigned by form on submit |
| `step_name` | text | NO | — | Required |
| `description` | text | YES | — | What the step does (replaced inputs+outputs Apr 19) |
| `applications_used` | text | YES | — | Software/tools used (e.g. "Yardi, Outlook") — added Apr 19 |
| `owner` | text | YES | — | Who performs the step (added Apr 19) |
| `estimated_time` | text | YES | — | Free text ("15 min", "~2 hrs") — renamed from `time_spent` Apr 19 |
| `handed_to` | text | YES | — | Who receives the output |

Dashboard query: `workflows` with nested `workflow_steps(*)`, ordered by `created_at DESC`, steps sorted client-side by `step_number`.

### Row-Level Security
RLS is **disabled** on both tables (no policies defined). The anon key embedded in the public Vercel bundle has full read/write. Acceptable for internal-only use, but worth revisiting if the form URL leaks externally.

---

## File map

```
workflow-capture/
├── app/
│   ├── layout.tsx          # Root layout, nav, font setup
│   ├── page.tsx            # Form (log workflow)
│   ├── dashboard/page.tsx  # List + expand view
│   └── globals.css         # Tailwind base
├── lib/
│   └── supabase.ts         # Single shared Supabase client
├── public/                 # (Next.js default icons)
├── .env.local              # NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
└── README.md               # Create Next App default
```

---

## Build history

Three commits on `main`:

| SHA | Date | What changed |
|-----|------|--------------|
| `416e736` | 2026-04-11 16:30 PT | Initial Create Next App scaffold |
| `f4547a9` | 2026-04-11 16:35 PT | Initial workflow capture tool setup — single-task form, dashboard, Supabase client, nav layout |
| `c470619` | 2026-04-12 10:05 PT | Refactored to multi-step model (workflows + workflow_steps tables), added Role field, expandable dashboard cards, construction-context placeholders |

Total build time was ~a few hours across Apr 11–12. Git is the source of truth for what's changed — chat transcripts from those sessions were not preserved.

### Post-build schema fixes (Apr 16, 2026)

These were applied directly in the Supabase SQL Editor to bring the live DB in sync with the code and clean up legacy. No code change needed.

```sql
-- Fix: code sent `role` but column didn't exist (live form was broken)
alter table workflows add column role text;

-- Cleanup: remove orphan table from pre-refactor single-task model
drop table workflow_tasks;

-- Hardening: enforce non-null workflow_id on steps
-- (FK workflow_steps_workflow_id_fkey was already present)
alter table workflow_steps alter column workflow_id set not null;
```

**Convention going forward:** any schema change in code must be paired with a migration noted here (or, better, in a `supabase/migrations/` folder when we add one). Don't let code and DB drift again.

### Form expansion (Apr 19, 2026)

Added richer capture fields to surface automation signal. Schema migration and code updated in same session; deployed via git push to Vercel.

```sql
-- Workflow-level additions
alter table workflows
  add column responsible_parties text,
  add column critical_assumptions text;

-- Step-level: add new fields, drop inputs/outputs (replaced by single description), rename time_spent
alter table workflow_steps
  add column description text,
  add column applications_used text,
  add column owner text,
  drop column inputs,
  drop column outputs;

alter table workflow_steps rename column time_spent to estimated_time;
```

Form UI reorganized: step fields are now Description (textarea) → Applications Used → 3-column row of Owner / Estimated Time / Handed To. Dashboard expanded view shows Role + Responsible Parties + Critical Assumptions at the workflow level, and Description + Applications + Owner + Est. Time + Handed To per step.

---

## Environment setup

`.env.local` (already present, not in git):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Run locally:
```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Current state & known gaps

**Deployed:** Live on Vercel. Currently in a 2-week data-collection window (Apr 16 → ~Apr 30) — SPC team members inputting their workflows.

**Working:**
- Log form submits workflow + steps atomically (workflow first, then steps with FK)
- Dashboard lists all workflows, click to expand steps
- Step count + submitter + date shown on each card
- Add/remove steps dynamically in the form
- Schema/code in sync as of Apr 16 (role column, FK integrity)

**Not yet built (planned for analysis phase, ~Apr 30):**
- Dashboard filters (by submitter, role, frequency)
- Aggregate stats card (total workflows, submitters, avg steps)
- CSV export (workflows joined with steps) for offline analysis
- Group-by-submitter view
- Submission tracker — who has vs. hasn't submitted yet
- Richer step metadata (tools/apps used, friction notes)

**Nice-to-have (not scheduled):**
- Auth — anyone with URL can submit/view (acceptable for now, internal only)
- Edit / delete existing workflows
- Admin approval flow

**UX tweaks worth considering:**
- Success toast rather than inline message
- Preserve partial form data on accidental refresh (localStorage)
- Show workflow count per submitter on dashboard

---

## Conventions established

- All form/dashboard components are `"use client"` — no server components yet
- Tailwind utility classes inline, no custom CSS beyond `globals.css`
- Single shared Supabase client in `lib/supabase.ts`; imported as `@/lib/supabase`
- Field naming is snake_case in DB, camelCase in local React state, mapped inline at insert
- Placeholder examples reference real SPC context (Grady Lakamp, "Subcontractor Invoice Review & Coding", etc.)

---

## For the next Claude session

If you're opening this project fresh:

1. Read this file first
2. `git log --oneline` to see recent work
3. `app/page.tsx` + `app/dashboard/page.tsx` are the two files that matter
4. `lib/supabase.ts` is where the backend connection lives
5. Data model is in the table above — the Supabase project itself has the live schema

The chat transcripts from the original build are **not recoverable** — Claude Code desktop only keeps the current CLI session's transcript on disk. Update this file at the end of meaningful work sessions so context survives.
