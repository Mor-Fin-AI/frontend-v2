# Mor Finance API (apps/api) — separate from the Vercel frontend (apps/web).
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY apps/api ./apps/api
RUN mkdir -p apps/web/src/lib/contracts
COPY apps/web/src/lib/contracts/deployments.arbitrum.json ./apps/web/src/lib/contracts/deployments.arbitrum.json
COPY docs ./docs
COPY integrations ./integrations

ENV SERVER_PORT=3001
EXPOSE 3001

CMD ["npx", "tsx", "apps/api/index.ts"]
