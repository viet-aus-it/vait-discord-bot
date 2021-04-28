FROM node:14.16-alpine3.13 as base
WORKDIR /srv/app

#############
# Dev image #
#############
FROM base as development

# Install Node modules
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --non-interactive

COPY . .
CMD ["yarn", "start"]

#####################
# Production build #
#####################
FROM development as build

RUN yarn build && \
    yarn cache clean

# install production deps
RUN yarn install --production --non-interactive


####################
# Production image #
####################
FROM base as production

COPY --chown=node:node --from=build /src/app/build build
COPY --chown=node:node --from=build /src/app/node_modules node_modules

USER node
CMD ["node", "build/index.js"]
