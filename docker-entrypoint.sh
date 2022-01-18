#!/bin/sh

wait-for $POSTGRES_HOST:$PORT -- echo "DB is ready now";

# Migrate database structure and generate Prisma client
npm run prisma:migrate;
npm run prisma:gen;

# Rebuild esbuild for consistent build environment
npm rebuild esbuild

exec "$@";
