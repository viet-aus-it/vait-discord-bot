FROM node:14.17-alpine3.14 as base
WORKDIR /src

#############
# Dev image #
#############
FROM base as development

# Install OS dependencies
RUN set -xe && \
    apk update && \
    apk add --no-cache git curl py-pip && \
    apk add --no-cache -t build-dependencies make gcc g++ libtool autoconf automake && \
    rm -rf /var/cache/apk/*
RUN yarn global add node-gyp

ARG WAIT_FOR=2.1.2
ARG WAIT_FOR_URL=https://github.com/eficode/wait-for/releases/download/v${WAIT_FOR}/wait-for
RUN curl -LkSso /usr/local/bin/wait-for ${WAIT_FOR_URL} && \
    chmod +x /usr/local/bin/wait-for

# Install Node modules
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --non-interactive

COPY . .
RUN cp ./entrypoint.sh /usr/local/bin/discord-bot-entrypoint.sh && \
    chmod +x /usr/local/bin/discord-bot-entrypoint.sh
CMD ["/usr/local/bin/discord-bot-entrypoint.sh", "yarn", "start"]

#####################
# Production build #
#####################
FROM development as build
ENV NODE_ENV=production
RUN yarn build && \
    yarn install --production --non-interactive && \
    yarn cache clean

####################
# Production image #
####################
FROM base as production

COPY --chown=node:node --from=build /src/build build
COPY --chown=node:node --from=build /src/node_modules node_modules

USER node
ENV NODE_ENV=production
CMD ["node", "build/index.js"]
