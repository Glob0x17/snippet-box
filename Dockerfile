### Stage 1 — build client + server bundle
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/

RUN npm ci && npm ci --prefix client

COPY tsconfig.json nodemon.json ./
COPY src ./src
COPY client ./client

RUN npm run build

### Stage 2 — runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

RUN mkdir -p ./data ./sessions

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:5000/auth/me || exit 0

CMD ["node", "build/server.js"]
