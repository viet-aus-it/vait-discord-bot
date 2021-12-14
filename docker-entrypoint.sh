#!/bin/sh

wait-for $POSTGRES_HOST:$PORT -- echo "DB is ready now";
npm run prisma:migrate;
npm run prisma:gen;

exec "$@";
