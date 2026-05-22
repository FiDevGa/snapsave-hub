# SnapSave Hub

A universal social media downloader that lets anyone paste any video/audio URL and instantly download it as MP4 or MP3. Supports 20+ platforms including YouTube, TikTok, Instagram, Twitter/X, SoundCloud, Reddit, Twitch, and more via yt-dlp.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/snapsave-hub run dev` — run the frontend (port 23554)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `SOURCE_CODE_PASSWORD` — password for source code page (default: `snapsave2024`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + framer-motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Downloader: yt-dlp (at `~/.nix-profile/bin/yt-dlp`) + ffmpeg
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/db/src/schema/downloads.ts` — download history table
- `artifacts/api-server/src/lib/ytdlp.ts` — yt-dlp integration, platform detection, download logic
- `artifacts/api-server/src/routes/` — download, history, platforms, auth, stats routes
- `artifacts/snapsave-hub/src/` — React frontend (pages, components, sidebar)

## Architecture decisions

- yt-dlp spawned as a child process from Node.js; download jobs are tracked in-memory with a Map (jobId → status)
- Completed downloads saved to PostgreSQL `downloads` table for history/favorites/stats
- Platform detection is done by regex matching on the URL (client-side badge + server-side extraction)
- Source code page is password-protected via a simple shared secret (constant-time comparison); token is session-only (not persisted)
- File downloads streamed directly from `/tmp/snapsave-downloads/{jobId}/` via Express `res.download()`

## Product

- Universal URL input: paste any link, auto-detects platform and shows metadata
- MP4/MP3 download: yt-dlp handles format selection and merging
- 20+ platform pages in the sidebar (YouTube, TikTok, Instagram, Twitter, SoundCloud, Reddit, Twitch, Kick, Bilibili, etc.)
- Download history with favorites, stats dashboard
- Password-protected source code explorer (VS Code-inspired)
- Settings page, About, Support
- Dark terminal aesthetic with neon accents

## Gotchas

- yt-dlp binary lives at `~/.nix-profile/bin/yt-dlp` in the Replit environment
- ffmpeg is available at `/nix/store/.../bin/ffmpeg` via Replit's default runtime
- Download jobs are in-memory only — they reset on server restart
- `SOURCE_CODE_PASSWORD` defaults to `snapsave2024` if not set in env

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
