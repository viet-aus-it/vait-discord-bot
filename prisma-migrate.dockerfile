FROM node:18.15-bullseye-slim
WORKDIR /app

# Install global node modules: pnpm
RUN npm install -g pnpm@8.1.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

ENV NODE_ENV=production
ENTRYPOINT ["pnpm", "run", "prisma:deploy"]
VOLUME ["/app/prisma"]
