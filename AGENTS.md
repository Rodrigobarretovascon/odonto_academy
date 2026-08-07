# AGENTS.md

## Cursor Cloud specific instructions

GB Dental is a single full-stack app (not a monorepo): a React 19 + Vite frontend, an
Express (`tsx`) backend under `server/`, and a PostgreSQL database. Standard scripts live in
the root `package.json` and `server/package.json`; the DB is defined in `docker-compose.yml`.
Refer to those files for the canonical commands rather than duplicating them here.

### Startup (services are NOT started by the update script)

The update script only refreshes npm dependencies. Each session you must start services yourself:

1. Docker daemon: not managed by systemd here. Start it once per session in the background
   (e.g. `sudo dockerd` in a tmux session) before using Docker. It is configured for this VM
   via `/etc/docker/daemon.json` with `storage-driver: fuse-overlayfs` and
   `features.containerd-snapshotter: false` (required for Docker 29 + fuse-overlayfs). Do not
   remove that config.
2. Database: `npm run db:up` (Postgres 16 in Docker, host port **5433**). First-time only, also
   run `npm run db:init` and `npm run db:seed` to create the schema and the seed admin user.
   The Postgres data lives in a Docker named volume, so schema/seed usually persist across
   sessions once created — re-running `db:init`/`db:seed` is idempotent.
3. App (dev): `npm run dev:server` (API on **3001**) and `npm run dev` (Vite on **5173**), or
   `npm run dev:all` for both. Vite proxies `/api`, `/models`, `/tmp`, `/uploads` to `:3001`.

### Environment

- Copy `.env.example` to `.env` at the repo root (gitignored). The backend loads `../.env`
  relative to `server/`, so the single root `.env` covers both frontend and backend.
- Optional integrations (OpenAI, Mercado Pago, CPF lookup, Sketchfab) are off by default;
  without keys the AI chat falls back to a local engine and checkout runs in demo mode.

### Seed admin login

`admin@gabrielabarreto.com` / `admin123` (overridable via `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
After login the member area is at `/app` and the admin panel at `/admin`.

### Lint / test / build

- No dedicated lint script; use `npx tsc -b` for typechecking.
- Tests: `npm test` (Vitest). Note: `src/modules/dental-sculpture/__tests__/sculpture-audit.test.ts`
  has one pre-existing failing assertion ("quiz tem 10 itens com resposta válida") unrelated to
  environment setup.
- Build: `npm run build` (`tsc -b && vite build`). Production run is `npm run start` (serves
  `dist/` from the API on `:3001`); use dev servers for development.
