#!/bin/sh

wait-for $POSTGRES_HOST:$PORT -- echo "DB is ready now";
yarn prisma:migrate;
yarn prisma:gen;

exec "$@";
