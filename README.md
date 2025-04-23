# FSP Cup 2025 — Backend Monorepo

Микросервисная backend‑платформа для соревнований на NestJS, PostgreSQL и Docker.

---

## 📦 Архитектура

* **api-gateway** — публичный REST API и маршрутизатор (общение с микросервисами по RPC)
* **users-service** — микросервис управления пользователями, аутентификацией и ролями
* **core-service** — основной микросервис (соревнования, команды и др. бизнес‑логика)
* **db** — PostgreSQL база данных

Общение между сервисами по TCP (NestJS microservices). Вся инфраструктура запускается через Docker Compose.

---

## ⚙️ Подготовка

1. **Склонируй репозиторий.**
2. **Создай файл `.env` на основе `.env.example`:**

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=fsptest
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=fsptest
```

---

## 🚀 Запуск в режиме разработки (Hot Reload)

1. Убедись, что Docker установлен.
2. Запусти команду:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

* Все микросервисы (`users-service`, `core-service`, `api-gateway`) стартуют в режиме **hot reload** (`nest start <project> --watch`).
* Изменения в коде в папках `apps/*/src` автоматически подхватываются и перезапускают сервис.

---

## 🏭 Запуск в продакшене

1. Собери и запусти сервисы одной командой:

```bash
docker-compose up --build
```

* Применяются production-настройки.
* Контейнеры собираются и запускаются без hot reload.

---

## 🧩 Краткая структура проекта

```
apps/
  api-gateway/
  core-service/
  users-service/
.env
docker-compose.yml
docker-compose.dev.yml
```

---

## 🧱 Технологический стек

* [NestJS](https://docs.nestjs.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [Docker Compose](https://docs.docker.com/)
* [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)

---

## 🛠️ Полезные команды

```bash
docker-compose down -v         # удалить все контейнеры и volume базы
docker-compose logs -f         # смотреть логи всех сервисов
docker exec -it <container> sh # войти внутрь контейнера (например, users-service-dev)
```

---

## ✅ Готово!

Теперь ты можешь полноценно разрабатывать и запускать платформу в единой среде — и для девелопмента, и для продакшена.
