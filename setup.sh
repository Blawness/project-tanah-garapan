#!/bin/bash

echo "========================================="
echo "  Project Tanah Garapan - Quick Setup"
echo "========================================="
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
echo "[3/5] Setting up database schema..."
npm run db:push
if [ $? -ne 0 ]; then
    echo "Error: Failed to setup database schema"
    echo "Make sure MySQL is running and database exists"
    exit 1
fi

echo
echo "[4/5] Seeding database with sample data..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "Error: Failed to seed database"
    exit 1
fi

echo
echo "[5/5] Creating uploads directory..."
mkdir -p uploads/tanah-garapan

echo
echo "========================================="
echo "  Setup completed successfully!"
echo "========================================="
echo
echo "Demo accounts:"
echo "  Developer: developer@example.com / password123"
echo "  Admin:     admin@example.com / password123"
echo "  Manager:   manager@example.com / password123"
echo "  User:      user@example.com / password123"
echo
echo "Starting development server..."
echo "Visit: http://localhost:3000"
echo
npm run dev
