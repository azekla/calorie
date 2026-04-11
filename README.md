# TG Calorie

Полноценное веб-приложение для подсчёта калорий с backend на Go и frontend на React.

## Что внутри

- регистрация, вход, выход, профиль
- регистрация с параметрами тела и авторасчётом нормы калорий
- минималистичный дневник питания с CRUD и калькулятором по 100 г
- быстрые повторы из последних записей
- шаблоны блюд прямо из дневника
- вода, шаги, вес
- история по дням
- demo seed для первого запуска

## Стек

- Backend: Go, Gin, GORM, PostgreSQL, JWT cookie auth
- Frontend: React, Vite, Context API, адаптивный CSS
- Infra: Docker, Docker Compose

## Сайт на VDS

Проект уже адаптирован под следующий production-сценарий:

- frontend и backend работают под одним origin
- API вызывается через `/api`
- подготовлен `docker-compose.prod.yml` для VDS
- frontend и backend публикуются только на `127.0.0.1`
- внешний `nginx` и HTTPS настраиваются на хосте сервера

Что понадобится позже:

- публичный `HTTPS` URL
- домен или поддомен, указывающий на сервер

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

## Production для OVH VDS

Подготовлен отдельный production compose:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Production схема:

- `frontend` доступен только локально на `127.0.0.1:3000`
- `backend` доступен только локально на `127.0.0.1:8080`
- системный `nginx` на сервере принимает внешний трафик
- `/` -> frontend
- `/api` и `/health` -> backend
- PostgreSQL не публикуется наружу

Файлы:

- `docker-compose.prod.yml`
- `infra/nginx/tg-calorie.ovh.conf`
- `frontend/Dockerfile.prod`

## Пошаговый деплой на OVH

1. Установи Docker, Docker Compose plugin, nginx и certbot:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
sudo usermod -aG docker $USER
```

2. Перелогинься по SSH, клонируй проект и создай `.env`:

```env
POSTGRES_DB=tg_calorie
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME_STRONG_DB_PASSWORD
JWT_SECRET=CHANGE_ME_LONG_RANDOM_SECRET
FRONTEND_URL=https://app.example.com
ALLOWED_ORIGINS=https://app.example.com
DEMO_EMAIL=demo@tgcalorie.local
DEMO_PASSWORD=demo12345
```

3. Подними контейнеры:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

4. Проверь локальные сервисы:

```bash
curl http://127.0.0.1:3000
curl http://127.0.0.1:8080/health
```

5. Скопируй `infra/nginx/tg-calorie.ovh.conf` в `/etc/nginx/sites-available/tg-calorie` и замени `app.example.com` на свой домен.

6. Включи сайт:

```bash
sudo ln -s /etc/nginx/sites-available/tg-calorie /etc/nginx/sites-enabled/tg-calorie
sudo nginx -t
sudo systemctl reload nginx
```

7. Выпусти сертификат:

```bash
sudo certbot --nginx -d app.example.com
```

8. Убедись, что сайт открывается по `https://app.example.com`.

9. После обновлений приложения деплой:

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Цели и калории

В приложении теперь доступны:

- выбор цели из списка:
  - похудение
  - поддержание
  - набор массы
- регистрация с вводом параметров тела
- рекомендованная норма калорий
- активная дневная цель
- ручное задание дневной нормы калорий
- быстрые повторы из последних записей и шаблонов

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
- `GET /api/entries/recent`
- `POST /api/entries`
- `PUT /api/entries/:id`
- `DELETE /api/entries/:id`
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
- 2 шаблона блюд
- записи питания за несколько дней
- воду, шаги и историю веса
