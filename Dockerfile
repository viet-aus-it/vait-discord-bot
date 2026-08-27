################
# Build assets #
################
FROM node:24.19 AS build
WORKDIR /app

# Install global node modules: pnpm
RUN npm install -g pnpm@11.2
ENV PNPM_ARGS="--frozen-lockfile --ignore-scripts"

# Install Node modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install ${PNPM_ARGS}

COPY . .

ENV NODE_ENV=production
RUN pnpm build
RUN pnpm install --production ${PNPM_ARGS}

####################
# Production image #
####################
FROM node:24.19-slim AS production
WORKDIR /app

COPY --chown=node:node --from=build /app/build build
COPY --chown=node:node --from=build /app/node_modules node_modules

USER node
ENV NODE_ENV=production
CMD ["--import", "/app/build/server/telemetry.cjs", "--enable-source-maps", "/app/build/server/main.cjs"]
