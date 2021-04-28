FROM node:14.16-alpine3.13 as base
WORKDIR /src

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

# Clear build node_modules
RUN rm -rf node_modules
# install modules
RUN yarn install --production --non-interactive


####################
# Production image #
####################
FROM base as production

COPY --chown=node:node --from=build /src/build build
COPY --chown=node:node --from=build /src/node_modules node_modules

USER node
CMD ["node", "build/index.js"]
