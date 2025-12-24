#!/bin/sh
set -e

echo "Running Prisma generate..."
npx prisma generate

echo "Running Prisma migrate deploy..."
npx prisma migrate deploy

echo "Starting Node server..."
exec node dist/server.js


