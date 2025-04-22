# FSP Cup 2025 — Backend Monorepo

Микросервисное backend-приложение для платформы соревнований на NestJS с использованием PostgreSQL, Docker и Docker Compose.

---

## 📦 Сервисы

- **api-gateway** — публичный REST API, маршрутизатор запросов
- **core-service** — основной бизнес-логика микросервис
- **users-service** — работа с пользователями
- **db** — PostgreSQL база данных

---

## ⚙️ Подготовка

1. Скопируйте `.env.example` и создайте файл `.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mydatabase
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=mydatabase
```

---

## 🚀 Запуск в режиме разработки (hot reload)

В dev-режиме используется `nest start <project> --watch`. Изменения кода автоматически перекомпилируются и подхватываются.

```bash
docker-compose -f docker-compose.dev.yml up --build
```

🛠️ Hot reload работает через polling (файл `webpack-hmr.config.js`), так что изменения в `.ts` файлах внутри `apps/*/src` применяются автоматически.

---

## 🧪 Проверка API

После запуска:

* `http://localhost:3000/api/users` — запрос через gateway
* `http://localhost:4001/` — users-service напрямую
* `http://localhost:4002/` — core-service напрямую

---

## 📦 Запуск в продакшене

Продакшн-сборка использует индивидуальные `Dockerfile` в `apps/*`.

```bash
docker-compose up --build
```

---

## 🧹 Полезные команды

```bash
docker-compose down -v       # удалить контейнеры и volume базы
docker-compose logs -f       # смотреть логи
docker exec -it <container> sh  # зайти внутрь контейнера
```

---

## 🧱 Стек технологий

* [NestJS](https://docs.nestjs.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [Docker &amp; Compose](https://docs.docker.com/)
* [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)

---

## 📁 Структура проекта

```
apps/
├── api-gateway/
├── core-service/
└── users-service/
```

---

## 🧠 Советы

* Для Node.js используется образ `node:20-alpine`.

---

## ✅ Готово!

Ты можешь теперь разрабатывать и запускать систему как в дев, так и в проде, используя один и тот же репозиторий, благодаря Docker + Nest CLI + Workspaces.
