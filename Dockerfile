################
# Build assets #
################
FROM node:16.15-bullseye as build
WORKDIR /app

# Install global node modules: ts-node & pnpm
RUN npm install -g ts-node pnpm

# Install Node modules
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN pnpm prisma:gen && \
    pnpm build

####################
# Production image #
####################
FROM node:16.15-bullseye-slim as production
WORKDIR /app

COPY --chown=node:node --from=build /app/build build

USER node
ENV NODE_ENV=production
CMD ["build/server/index.js"]
