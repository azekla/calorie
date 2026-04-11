# TG Calorie

Полноценное мини-веб-приложение для подсчёта калорий с backend на Go и Telegram WebApp-интеграцией на React.

## Что внутри

- регистрация, вход, выход, профиль
- цель калорий с авторасчётом по параметрам пользователя
- дневник питания с CRUD
- избранные продукты
- конструктор блюда и шаблоны
- вода, шаги, вес
- dashboard со streak, challenge, kitty mood, sweet tracker и balance summary
- история по дням
- demo seed для первого запуска

## Стек

- Backend: Go, Gin, GORM, PostgreSQL, JWT cookie auth
- Frontend: React, Vite, Context API, адаптивный CSS
- Infra: Docker, Docker Compose

## Telegram Web App и Oracle Ubuntu

Проект уже адаптирован под следующий production-сценарий:

- frontend и backend работают под одним origin
- API вызывается через `/api`
- есть endpoint `POST /api/auth/telegram`
- поддержан автологин через Telegram `initData`
- подготовлен `docker-compose.prod.yml` для Oracle Ubuntu
- есть `nginx` reverse proxy для внешнего запуска через IP, домен или `ngrok`

Что понадобится позже:

- `TELEGRAM_BOT_TOKEN`
- публичный `HTTPS` URL
- для бесплатного старта можно использовать `ngrok`

## Структура

```text
backend/
  cmd/app/main.go
  internal/config
  internal/models
  internal/repository
  internal/services
  internal/handlers
  internal/middleware
  internal/routes
  internal/utils
  internal/seed

frontend/
  src/components
  src/pages
  src/layouts
  src/hooks
  src/api
  src/context
  src/utils
  src/styles
```

## Запуск через Docker Compose

1. Скопируй `.env.example` в `.env`
2. Запусти:

```bash
docker compose up --build
```

3. Открой:

- frontend: `http://localhost:5173`
- backend: `http://localhost:8080`

В dev-режиме frontend работает через Vite proxy и ходит к backend по `/api`.

## Демо-вход

- email: `demo@tgcalorie.local`
- пароль: `demo12345`

## Локальный запуск без Docker

### Backend

```bash
cd backend
go mod tidy
go run ./cmd/app
```

Нужен PostgreSQL и переменные окружения:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Production для Oracle Ubuntu

Подготовлен отдельный production compose:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Production схема:

- `nginx` принимает внешний трафик
- `/` -> frontend
- `/api` -> backend
- PostgreSQL не публикуется наружу

Файлы:

- `docker-compose.prod.yml`
- `infra/nginx/nginx.conf`
- `frontend/Dockerfile.prod`

## Временный бесплатный запуск через ngrok

Если домена ещё нет, можно использовать `ngrok`.

Логика такая:

1. Поднять production stack на сервере
2. Пробросить наружу порт `80`
3. Получить `https://...ngrok-free.app`
4. Использовать этот URL как Web App URL в Telegram

При таком запуске укажи в `.env`:

```env
FRONTEND_URL=https://your-ngrok-url.ngrok-free.app
ALLOWED_ORIGINS=https://your-ngrok-url.ngrok-free.app
TELEGRAM_BOT_TOKEN=your_bot_token
```

## Telegram Web App auth

Поддерживается endpoint:

- `POST /api/auth/telegram`

Frontend:

- автоматически определяет `window.Telegram.WebApp`
- вызывает `Telegram.WebApp.ready()` и `expand()`
- пытается выполнить автологин через `initData`
- вне Telegram сохраняется обычный login/register flow

Backend:

- валидирует `initData` через `TELEGRAM_BOT_TOKEN`
- создаёт пользователя при первом входе
- создаёт cookie session как и при обычном входе

Пока `TELEGRAM_BOT_TOKEN` не задан, Telegram auth endpoint будет отвечать ошибкой настройки.

## Цели и калории

В профиле теперь доступны:

- выбор цели из списка:
  - похудение
  - поддержание
  - набор массы
- рекомендованная норма калорий
- активная дневная цель
- ручное задание дневной нормы калорий

Если ручной режим выключен, активная цель берётся из расчёта автоматически.

## Основные API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/profile`
- `PUT /api/profile`
- `PUT /api/profile/goals`
- `GET /api/entries?date=`
- `POST /api/entries`
- `PUT /api/entries/:id`
- `DELETE /api/entries/:id`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:id`
- `GET /api/meals`
- `POST /api/meals`
- `PUT /api/meals/:id`
- `DELETE /api/meals/:id`
- `POST /api/meals/:id/add-to-day`
- `GET /api/water?date=`
- `POST /api/water`
- `GET /api/steps?date=`
- `POST /api/steps`
- `GET /api/weight`
- `POST /api/weight`
- `GET /api/stats/today`
- `GET /api/stats/history`
- `GET /api/stats/summary`
- `POST /api/stats/can-i-eat`
- `GET /api/challenges/today`
- `GET /api/streak`

## Особенности дизайна

- pastel pink palette
- белые карточки с большими скруглениями
- mobile-first layout
- мягкие тени и спокойные анимации
- три темы: `soft pink`, `sakura pink`, `strawberry milk`

## Seed/demo data

При первом запуске backend автоматически создаёт:

- demo-пользователя
- профиль и цели
- избранные продукты
- 2 шаблона блюд
- записи питания за несколько дней
- воду, шаги и историю веса
