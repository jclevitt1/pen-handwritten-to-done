# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page for **Pen** - a note-taking app that converts handwritten notes into actionable outputs using AI. This is a React SPA built for waitlist signups before the main iOS app launches.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 8080
npm run build        # Production build to dist/
npm run lint         # ESLint check
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
```

## Architecture

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui

**Path Alias:** `@/` maps to `src/`

**Key Directories:**
- `src/components/` - Page sections (Hero, HowItWorks, UseCases, etc.) and `ui/` subdirectory with shadcn components
- `src/pages/` - Route pages (Index.tsx is the main landing page)
- `src/hooks/` - Custom hooks (use-mobile, use-toast)
- `src/lib/utils.ts` - Utility functions including `cn()` for class merging

**Component Pattern:** Landing page sections are composed in `src/pages/Index.tsx`. Each section is a self-contained component with Framer Motion animations.

**UI Components:** Uses shadcn/ui (Radix-based). Add new components with `npx shadcn@latest add <component>`.

## Authentication

Uses **Clerk** for auth (same instance as iOS app).

- `src/lib/config.ts` - Clerk publishable key and API URL
- `src/pages/SignIn.tsx` / `SignUp.tsx` - Clerk components with dark theme styling
- `src/pages/Dashboard.tsx` - Protected route, redirects to /sign-in if not authenticated

**Flow:** Landing page → Sign In → Dashboard (project list)

## Backend API

`src/lib/api.ts` - API client matching iOS `BackendService.swift`

**Endpoints used:**
- `GET /projects` - List user's projects (metadata only)
- `GET /projects/{id}/files` - List files in project
- `POST /jobs` - Submit processing jobs

Projects are stored in backend (DynamoDB + S3), not in browser. The web app only stores pointers/metadata.

**Environment:** Copy `.env.example` to `.env` and set `VITE_API_URL` after deploying Lambda.

## Styling

- Dark mode is default (class-based via `darkMode: ["class"]`)
- Primary accent: warm orange (#f4a82b)
- Fonts: Inter (body), Caveat (handwriting accents via `font-handwriting` class)
- Colors use CSS variables defined in `src/index.css`
- Custom animations: `animate-float`, `animate-draw`, `animate-fade-up`

## Lovable Integration

This project syncs with Lovable IDE. The `lovable-tagger` plugin adds component tracking in development mode.
