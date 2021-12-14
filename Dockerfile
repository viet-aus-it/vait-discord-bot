#############
# Dev image #
#############
FROM node:16.13-bullseye as development
WORKDIR /src

ARG WAIT_FOR=2.1.2
ARG WAIT_FOR_URL=https://github.com/eficode/wait-for/releases/download/v${WAIT_FOR}/wait-for
RUN curl -LkSso /usr/local/bin/wait-for ${WAIT_FOR_URL} && \
    chmod +x /usr/local/bin/wait-for

# Install Node modules
COPY package.json package-lock.json tsconfig.json ./
RUN npm install

COPY . .
RUN cp ./docker-entrypoint.sh /usr/local/bin/discord-bot-entrypoint.sh && \
    chmod +x /usr/local/bin/discord-bot-entrypoint.sh && \
    npm run prisma:gen
CMD ["/usr/local/bin/discord-bot-entrypoint.sh", "npm", "run", "start"]

#####################
# Production build #
#####################
FROM development as build
ENV NODE_ENV=production
RUN npm run build && \
    npm ci --production --ignore-scripts && \
    npm run prisma:gen

####################
# Production image #
####################
FROM gcr.io/distroless/nodejs:16 as production

COPY --chown=node:node --from=build /src/build build
COPY --chown=node:node --from=build /src/node_modules node_modules

ENV NODE_ENV=production
CMD ["build/index.js"]
