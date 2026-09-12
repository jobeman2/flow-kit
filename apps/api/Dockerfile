FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @flow-kit/database db:generate
RUN pnpm --filter @flow-kit/web build
RUN pnpm --filter @flow-kit/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=4000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/sdk-web ./packages/sdk-web
COPY --from=builder /app/apps/api ./apps/api

EXPOSE 4000
CMD ["node", "apps/api/dist/apps/api/src/main.js"]
