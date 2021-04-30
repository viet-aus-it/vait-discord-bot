FROM node:14.16-alpine3.13 as base
WORKDIR /src

# Install OS dependencies
RUN set -xe && \
    apk update && \
    apk add --no-cache git curl py-pip && \
    apk add --no-cache -t build-dependencies make gcc g++ libtool autoconf automake && \
    rm -rf /var/cache/apk/*
RUN yarn global add node-gyp

#############
# Dev image #
#############
FROM base as development

# Install Node modules
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --non-interactive

COPY . .
CMD ["./entrypoint.sh", "yarn", "start"]

#####################
# Production build #
#####################
FROM development as build
ENV NODE_ENV=production
RUN yarn install --production --non-interactive
RUN yarn build && \
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
