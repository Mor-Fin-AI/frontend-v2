# Mor Finance API — separate from the Vercel frontend.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server ./server

ENV SERVER_PORT=3001
EXPOSE 3001

CMD ["npx", "tsx", "server/index.ts"]
