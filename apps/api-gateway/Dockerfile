FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./
COPY apps ./apps
COPY nest-cli.json ./
COPY tsconfig*.json ./

RUN yarn install --frozen-lockfile

# Сборка нужного сервиса
WORKDIR /app/apps/api-gateway
RUN yarn build:gateway

CMD ["node", "dist/apps/api-gateway/main.js"]
