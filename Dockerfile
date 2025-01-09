# Fase de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

# RUN yarn build && yarn typeorm migration:run -d dist/infrastructure/database/typeorm/index.js

# Instalar o cliente PostgreSQL para ter acesso ao pg_isready
RUN apk add --no-cache postgresql-client

EXPOSE 3333

CMD ["yarn", "start"]
