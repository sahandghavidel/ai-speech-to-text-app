# AI Speech-to-Text App

A full-stack Next.js application for authenticated users to manage speech-to-text workflows, account settings, and credit-based upgrades.

## Repository Structure

- `frontend/` – Main application (Next.js + TypeScript + Prisma + Better Auth + Polar)
- `backend/` – Placeholder folder (currently only `test.txt`)

## Current Implementation Status

The repository currently contains authentication, dashboard shell UI, account settings, customer portal integration, and credit tracking in the database.

Core transcription pages are referenced in navigation but are not yet implemented:

- `/dashboard/create` (Transcribe)
- `/dashboard/projects` (History)

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Prisma + PostgreSQL
- Better Auth (`better-auth`) for authentication
- Polar integration for checkout, billing portal, and webhook credit updates
- Tailwind CSS + shadcn/ui style components

## Prerequisites

- Node.js (recommended modern LTS)
- npm
- Docker or Podman (for local PostgreSQL via script)

## Environment Variables

Create `frontend/.env` from `frontend/.env.example` and set:

- `DATABASE_URL` (PostgreSQL URL)
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (e.g. `http://localhost:3000`)
- `POLAR_ACCESS_TOKEN`
- `POLAR_WEBHOOK_SECRET`

> The app validates env variables at startup/build via `src/env.js`.

## Local Setup

1. Install dependencies:
   - `cd /home/runner/work/ai-speech-to-text-app/ai-speech-to-text-app/frontend`
   - `npm ci`
2. Create env file:
   - `cp .env.example .env`
   - Fill all required values
3. Start local PostgreSQL (optional helper):
   - `./start-database.sh`
4. Apply database schema:
   - `npm run db:migrate`
   - or for local development: `npm run db:generate`
5. Start the app:
   - `npm run dev`

Open: `http://localhost:3000`

## Useful Scripts (frontend)

- `npm run dev` – Start development server
- `npm run build` – Build production app
- `npm run start` – Start production server
- `npm run typecheck` – TypeScript check
- `npm run lint` – Next.js lint
- `npm run check` – Lint + typecheck
- `npm run db:migrate` – Deploy Prisma migrations
- `npm run db:generate` – Create/apply dev migration
- `npm run db:push` – Push schema to DB
- `npm run db:studio` – Open Prisma Studio

## Database Overview

Main Prisma models:

- `User` (includes `credits`, default 10)
- `Session`
- `Account`
- `Verification`
- `Transcript` (stores filename, language, text, model, user reference)

## Auth and Billing Flow

- Auth routes are exposed at `frontend/src/app/api/auth/[...all]/route.ts`
- Better Auth handles session/email-password auth
- Polar checkout + portal plugins are enabled in `src/lib/auth.ts`
- On successful Polar order, webhook logic increments user credits based on purchased product

## Notes

- The existing `frontend/README.md` is the default scaffold README from create-t3-app.
- This root README is the project-level documentation for current codebase behavior.
