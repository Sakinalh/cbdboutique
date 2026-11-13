# Node version passed by CI from .nvmrc (defaults to 24).
ARG NODE_VERSION=24

# ---------- Stage 1: build ----------
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /repo

# Enable pnpm (version read from "packageManager" in the root package.json).
RUN corepack enable

# Dependency manifests first, so the install layer stays cached.
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

COPY apps/api/package.json apps/api/
COPY packages/config/package.json packages/config/

# Install only the API and its workspace dependencies.
RUN pnpm install --frozen-lockfile --filter @cbd/api...

# Source code last: it changes most often.
COPY apps/api apps/api
COPY packages/config packages/config

RUN pnpm --filter @cbd/api run build:node

# ---------- Stage 2: runtime ----------
FROM node:${NODE_VERSION}-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/apps/api/dist/node/server.js ./

# Do not run as root: the node image provides a "node" user.
USER node
EXPOSE 3000
CMD ["node", "server.js"]
