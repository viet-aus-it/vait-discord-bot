#!/bin/sh

wait-for $DB_HOST:$PORT -- echo "DB is ready now";
yarn prisma:migrate;
yarn prisma:gen;

exec "$@";
