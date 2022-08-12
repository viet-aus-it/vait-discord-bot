################
# Build assets #
################
FROM node:16.16-bullseye as build
WORKDIR /app

# Install global node modules: pnpm
RUN npm install -g pnpm@7

# Install Node modules
COPY package.json pnpm-lock.yaml prisma ./
RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm prisma:gen

COPY . .

ENV NODE_ENV=production
RUN pnpm build

####################
# Production image #
####################
FROM node:16.16-bullseye-slim as production
WORKDIR /app

COPY --chown=node:node --from=build /app/build build

USER node
ENV NODE_ENV=production
CMD ["--enable-source-maps", "build/server/index.js"]
