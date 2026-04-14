# Kawaii Calorie App

Pink-themed calorie tracking app. Russian-language UI.

## Stack

- **Frontend**: React 18, Vite 6, React Router DOM 6 (SPA)
- **Backend**: Go 1.25, Gin, GORM, PostgreSQL 16
- **Auth**: JWT in HttpOnly cookie (SameSite=Lax)
- **Infra**: Docker Compose (dev with hot-reload, prod with static builds)

## Running locally (development)

```bash
cp .env.example .env   # first time only
docker compose up -d --build
```

App: http://localhost:5173 | API: http://localhost:8080

### Hot-reload

Both services auto-reload on code changes — no manual restart needed.

- **Frontend**: Vite HMR. Source dirs (`src/`, `public/`, `index.html`, `vite.config.js`) are mounted as Docker volumes. Edits reflect instantly in the browser.
- **Backend**: [air](https://github.com/air-verse/air) live-reloader. The entire `backend/` dir is mounted into the container. Air watches `.go` files and rebuilds/restarts the server automatically. Config: `backend/.air.toml`, image: `backend/Dockerfile.dev`.

### Stopping

```bash
docker compose down          # stop containers
docker compose down -v       # stop + wipe DB volume
```

## Production build

The production backend uses `backend/Dockerfile` (multi-stage, no air). To deploy for prod, override the dockerfile or use a separate compose file.

## Project structure

```
frontend/
  src/
    pages/          # DiaryPage, HistoryPage, ProfilePage, LoginPage, RegisterPage
    components/     # FoodEntryForm, ProgressBar, ThemePicker
    layouts/        # AppLayout (sidebar + outlet)
    context/        # AuthContext (JWT session)
    hooks/          # useAsyncData
    api/            # client.js (fetch wrapper)
    utils/          # format.js (date formatting)
    styles/         # global.css (single stylesheet, no CSS modules)

backend/
  cmd/app/          # main.go entrypoint
  internal/
    config/         # env-based config
    handlers/       # HTTP handlers (auth, profile, stats, entries, meals)
    middleware/     # JWT auth middleware
    models/         # GORM models
    repository/    # DB queries
    routes/        # Gin router setup
    seed/          # Demo data seeder
    services/      # Business logic
    utils/         # JWT token generation
```

## Key conventions

- All UI text is in Russian
- CSS: single `global.css`, class-based (no modules/Tailwind), pink theme with 3 variants (soft-pink, sakura-pink, strawberry-milk)
- GORM updates: always use `map[string]interface{}` instead of struct-based `Updates()` to avoid zero-value field skipping (bool false, int 0)
- Dates: backend uses UTC (`time.UTC`), frontend parses date strings with `T00:00:00` suffix to avoid timezone offset bugs
- Environment variables are defined in `.env` (see `.env.example` for required keys)

## Useful commands

```bash
# Rebuild only backend
docker compose up -d --build backend

# Rebuild only frontend
docker compose up -d --build frontend

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Run Go build check (inside container)
docker compose exec backend go build ./...
```
