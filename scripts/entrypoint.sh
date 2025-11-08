#!/bin/sh
set -e

echo "Starting NestJS Application..."

echo "Waiting for PostgreSQL..."
./wait-for-it.sh postgres:5432 -t 30 || exit 1

echo "PostgreSQL is up"
npx prisma migrate deploy || exit 1

echo "Starting application..."
exec node dist/src/main.js
