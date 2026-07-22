# Mor Finance API — self-contained for Vercel Root Directory = apps/api.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY apps/api ./

ENV SERVER_PORT=3001
EXPOSE 3001

CMD ["npx", "tsx", "index.ts"]
