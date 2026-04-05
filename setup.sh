#!/bin/bash
# /// file: setup.sh ///
# SCOS Environment Bootstrap

echo "[1/4] Installing dependencies..."
npm install > /dev/null 2>&1

echo "[2/4] Setting up environment..."
cp .env.example .env

echo "[3/4] Starting development server..."
npm run dev > dev.log 2>&1 &
DEV_PID=$!

echo "[4/4] Executing Health Check..."
# Wait for the server to start (max 10 seconds)
for i in {1..10}; do
  if curl -s http://localhost:5173 > /dev/null; then
    echo "Health Check: PASSED - Sovereign Cognitive OS is online."
    break
  fi
  sleep 1
  if [ $i -eq 10 ]; then
    echo "Health Check: FAILED - Server did not start."
    kill $DEV_PID
  fi
done
