# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **Pen** (usepen.dev) — a note-taking app that converts handwritten notes into actionable outputs using AI. This repo is the React SPA: landing page, authenticated dashboard, and IDE-like project viewer with AI chat.

Part of the larger Pen ecosystem (iOS app in `FiatLux/`, backend in `FiatLux/backend/`, desktop app in `pen-desktop/`).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 8080
npm run build        # Production build to dist/
npm run build:dev    # Dev-mode build (includes source maps)
npm run lint         # ESLint check
npm run test         # Vitest (run once)
npm run test:watch   # Vitest (watch mode)
```

Tests use Vitest with jsdom environment. Config in `vitest.config.ts`, setup in `src/test/setup.ts`. Test pattern: `src/**/*.{test,spec}.{ts,tsx}`.

**Environment setup:** Copy `.env.example` to `.env`. Key vars: `VITE_API_URL` (backend URL, defaults to `https://api.usepen.dev`), `VITE_CLERK_PUBLISHABLE_KEY` (Clerk auth key).

## Architecture

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui

**Path Alias:** `@/` maps to `src/`

### Routing (src/App.tsx)

React Router v6 with these routes:
- `/` → `Index` — landing page (Hero, HowItWorks, UseCases, WaitlistCTA, Footer)
- `/dashboard` → `Dashboard` — protected project list with search
- `/project/:projectId` → `ProjectViewer` — IDE-like code viewer + AI chat
- `/sign-in`, `/sign-up` → Clerk auth components
- `*` → 404

Provider stack: ClerkProvider → QueryClientProvider → TooltipProvider → Toaster/Sonner → BrowserRouter.

### Key Pages

**Dashboard** — Lists user's projects (TanStack Query fetches from `/projects`). Each project shows language, framework, file count, source type (written from notes vs. uploaded). Has search, new project modal.

**ProjectViewer** — Three resizable panes:
- **Left:** FileTree (drag-drop via dnd-kit, context menu for rename/delete, folder creation)
- **Center:** CodeMirror editor with per-language syntax highlighting, or PDF/DOCX/markdown viewers
- **Right:** ChatPanel (Claude conversation about project code, async task polling, file edit proposals with auto-apply toggle)

Save with Cmd/Ctrl+S. Download individual files or entire project as zip.

### API Client (src/lib/api.ts)

Mirrors iOS `BackendService.swift`. Uses Clerk JWT via `setTokenGetter()`. Key method groups:
- **Projects:** CRUD on `/projects`, file listing, upload
- **Files:** update, delete, move, create folders
- **Chat:** `sendChatMessageAsync()` with two-step pattern — immediate response or task polling via `pollForCompletion()`
- **Upload:** direct to S3 via presigned URLs (`getPresignedUploadUrl()` + `uploadFileDirect()`) for large files, or base64 via `/upload` for small ones
- **Jobs:** legacy sync path (`submitJob`, `getJob`, `executeNotes`)

Config in `src/lib/config.ts` — reads from env vars with fallbacks.

### Components

- `src/components/` — landing page sections (Hero, HowItWorks, UseCases, etc.) with Framer Motion animations
- `src/components/ui/` — shadcn/ui components (Radix-based). Add new: `npx shadcn@latest add <component>`
- `src/components/ChatPanel.tsx` — AI chat with async task handling, edit proposals, markdown rendering
- `src/components/FileTree.tsx` — Recursive tree with dnd-kit drag-drop
- `src/components/NewProjectModal.tsx` — Two tabs: "Notes" (PDF upload for AI execution) and "Upload" (direct file upload)

## Styling

- Dark mode default (class-based: `darkMode: ["class"]`)
- Primary accent: warm orange (`hsl(38 92% 50%)` / `#f4a82b`)
- Fonts: Inter (body via `font-sans`), Caveat (handwriting via `font-handwriting`)
- CSS variables in `src/index.css` (colors, gradients, shadows)
- Custom animations: `animate-float`, `animate-draw`, `animate-fade-up`
- Utility classes: `.text-gradient`, `.glow-effect`, `.card-gradient`
- Typography plugin enabled for prose/markdown rendering

## Deployment

Cloudflare Pages via `wrangler.toml`. Builds from `dist/`. KV namespace `WAITLIST` for waitlist signups.

## Lovable Integration

This project syncs with Lovable IDE. The `lovable-tagger` plugin adds component tracking in development mode only.
