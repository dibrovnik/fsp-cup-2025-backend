# 1) Устанавливаем только продовые зависимости
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# 2) Собираем весь проект (build всех сервисов сразу)
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn build

# 3) Финальный образ — копируем node_modules + dist конкретного сервиса
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production

# только продовые зависимости
COPY --from=deps /app/node_modules ./node_modules

# только сборку этого конкретного сервиса
COPY --from=builder /app/dist/apps/api-gateway ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
