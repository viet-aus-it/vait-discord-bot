# Development image
#############
# Dev image #
#############
FROM node:14.16-alpine3.13 as development
ENV CI=true
WORKDIR /src

# Install Node modules
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install

COPY . .

EXPOSE 3000
CMD ["yarn", "start"]

#####################
# Production build #
#####################
FROM development as build
COPY .env ./
RUN yarn build && \
    yarn cache clean

####################
# Production image #
####################
FROM nginx:1.20-alpine as production

COPY .docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx
RUN rm -rf html;
COPY --chown=www-data:www-data --from=build /src/build ./html
COPY --chown=www-data:www-data .env ./html

EXPOSE 3000
USER nginx
CMD ["nginx", "-g", "daemon off;"]
