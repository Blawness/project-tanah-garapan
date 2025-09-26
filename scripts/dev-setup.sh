#!/bin/bash

echo "========================================"
echo "   Tanah Garapan - Development Setup"
echo "========================================"
echo

echo "[1/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo
echo "[2/5] Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "Error: Failed to generate Prisma client"
    exit 1
fi

echo
echo "[3/5] Pushing database schema..."
npx prisma db push
if [ $? -ne 0 ]; then
    echo "Error: Failed to push database schema"
    exit 1
fi

echo
echo "[4/5] Seeding database..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "Warning: Database seeding failed, but continuing..."
fi

echo
echo "[5/5] Starting development server..."
echo
echo "========================================"
echo "   Development server starting..."
echo "   URL: http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo "========================================"
echo

npm run dev
