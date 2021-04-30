#!/bin/sh

yarn prisma:migrate;
yarn prisma:gen;

exec "$@";
