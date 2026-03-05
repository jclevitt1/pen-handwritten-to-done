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

Run a single test file: `npx vitest run src/path/to/file.test.ts`

Tests use Vitest with jsdom environment. Config in `vitest.config.ts`, setup in `src/test/setup.ts`. Test pattern: `src/**/*.{test,spec}.{ts,tsx}`.

**Environment setup:** Copy `.env.example` to `.env`. Key vars: `VITE_API_URL` (backend URL, defaults to `https://api.usepen.dev`), `VITE_CLERK_PUBLISHABLE_KEY` (Clerk auth key).

## Architecture

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui

**Path Alias:** `@/` maps to `src/`

**State Management:** No Redux/Zustand — TanStack Query for server state, `useState` for local UI state. Always invalidate queries after mutations (`queryClient.invalidateQueries()`).

### Routing (src/App.tsx)

React Router v6. Provider stack: ClerkProvider → QueryClientProvider → TooltipProvider → Toaster/Sonner → BrowserRouter.

- `/` → `Index` — landing page (Hero, HowItWorks, ForStudents, UseCases, WaitlistCTA, Footer)
- `/dashboard` → `Dashboard` — protected project list with search + Jobs tab
- `/project/:projectId` → `ProjectViewer` — IDE-like code viewer + AI chat
- `/textbooks` → `Textbooks` — searchable textbook catalog with request form
- `/sign-in`, `/sign-up` → Clerk auth components
- `*` → 404

### Key Pages

**Dashboard** — Lists user's projects (TanStack Query fetches from `/projects`). Each project shows language, framework, file count, source type (written from notes vs. uploaded). Has search, new project modal, and Jobs tab for task visibility.

**ProjectViewer** — Three resizable panes:
- **Left:** FileTree (drag-drop via dnd-kit, context menu for rename/delete, folder creation)
- **Center:** CodeMirror editor with per-language syntax highlighting, or PDF/DOCX/markdown viewers
- **Right:** ChatPanel (Claude conversation about project code, async task polling, file edit proposals with auto-apply toggle)

Save with Cmd/Ctrl+S. Download individual files or entire project as zip.

### API Client (src/lib/api.ts)

Singleton `ApiClient` class. Uses Clerk JWT via `setTokenGetter()` — must be set in `useEffect` before any calls.

Key method groups:
- **Projects:** CRUD on `/projects`, file listing, upload
- **Files:** update, delete, move, create folders
- **Chat:** Two-step async pattern (see below)
- **Textbooks:** `listTextbooks(search?)`, `requestTextbook(data)`
- **Upload:** direct to S3 via presigned URLs for large files, or base64 via `/upload` for small ones
- **Tasks:** `listTasks()`, `getTask()`, `pollForCompletion()` for async job tracking

**Two-Step Async Chat Pattern:**
1. `sendChatMessageAsync()` → returns `ChatStreamResult`
2. If `type: 'immediate'` → response with edits (clarification or direct answer)
3. If `type: 'async'` → `taskId` for polling, show `preliminaryMessage` while waiting
4. Poll with `pollForCompletion(taskId)` until COMPLETED/FAILED

Config in `src/lib/config.ts` — reads from `VITE_*` env vars with fallbacks.

### Components

- `src/components/` — landing page sections (Hero, HowItWorks, UseCases, ForStudents, etc.) with Framer Motion animations
- `src/components/ui/` — shadcn/ui components (Radix-based). Add new: `npx shadcn@latest add <component>`
- `src/components/ChatPanel.tsx` — AI chat with async task handling, edit proposals, markdown rendering
- `src/components/FileTree.tsx` — Recursive tree with dnd-kit drag-drop
- `src/components/NewProjectModal.tsx` — Two tabs: "Notes" (PDF upload for AI execution) and "Upload" (direct file upload)

### ProjectViewer Internals

**Dirty state tracking:** `editedContent` + `isDirty` flag compared against original. File switching shows confirmation dialog if unsaved changes exist.

**File versioning:** `fileVersion` counter incremented after chat edits → triggers `useEffect` to re-fetch content from backend.

**File type routing:** Markdown → React Markdown preview, PDF → iframe, DOCX → Mammoth conversion, code → CodeMirror with language-specific extensions.

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

## Gotchas

- **File `path` vs `name`:** Backend uses `path` (S3 key) for operations but `name` for display. Always use `path` when calling API file operations.
- **No unsaved warning on navigation:** Dirty state only checked when switching files within ProjectViewer, not when navigating away via React Router.
- **Chat JSON parsing:** Backend sometimes returns raw JSON in chat responses. `ChatPanel.tsx` has safeguards to extract the message text.
- **Token getter timing:** `api.setTokenGetter()` must be called in `useEffect` before any API calls. Missing this causes silent auth failures.
