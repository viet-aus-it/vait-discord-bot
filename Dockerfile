################
# Build assets #
################
FROM node:20.10 as build
WORKDIR /app

# Install global node modules: pnpm
RUN npm install -g pnpm@8.15

# Install Node modules
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Generate Prisma schemas
COPY prisma ./prisma
RUN pnpm prisma:gen

COPY . .

ENV NODE_ENV=production
RUN pnpm build

####################
# Production image #
####################
FROM node:20.10-slim as production
WORKDIR /app

RUN set -xe && \
    apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /usr/share/man/* /usr/share/doc/*

COPY --chown=node:node --from=build /app/build build

USER node
ENV NODE_ENV=production
CMD ["--enable-source-maps", "build/server/index.js"]
