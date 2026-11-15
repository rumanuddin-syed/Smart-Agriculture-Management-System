#!/usr/bin/env bash
# start.sh — Start all Smart Agriculture Management services
# Usage: bash start.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
trap 'echo "Stopping..."; kill 0' EXIT

echo "🌿 Starting Plant Disease Pipeline (port 8000)..."
(
  cd "$SCRIPT_DIR/ml-services/plant-pipeline"
  source venv/bin/activate
  python3 -m uvicorn service.app:app --host 127.0.0.1 --port 8000
) &

echo "🖥️  Starting Node.js Backend (port 5000)..."
(
  cd "$SCRIPT_DIR/server"
  npm start
) &

echo "💻 Starting React Dev Server (port 5173)..."
(
  cd "$SCRIPT_DIR/client"
  npm run dev
) &

echo ""
echo "✅ All services starting. Press Ctrl+C to stop all."
echo "   Pipeline:  http://127.0.0.1:8000/health"
echo "   Backend:   http://localhost:5000"
echo "   Frontend:  http://localhost:5173"
echo ""

wait

