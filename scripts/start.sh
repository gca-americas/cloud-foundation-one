#!/usr/bin/env bash
# Start the Cloud 101 Workbench in the background. Use ./scripts/stop.sh to stop it.
set -euo pipefail

cd "$(dirname "$0")/.."
PORT="${CLOUD101_PORT:-4800}"
mkdir -p runs
PID_FILE="runs/workbench.pid"
LOG_FILE="runs/workbench.log"

# If an existing workbench process is running, stop it first for a clean restart.
if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null || true
    sleep 0.5
  fi
  rm -f "$PID_FILE"
fi
pkill -f "uvicorn server.main:app" 2>/dev/null || true

if [ ! -d .venv ]; then
  echo "· creating the virtual environment"
  uv venv --quiet
fi
uv sync --quiet

if [ ! -d web/dist ]; then
  echo "· building the page"
  (cd web && npm install --silent && npm run build)
fi

nohup .venv/bin/python -m uvicorn server.main:app --host 0.0.0.0 --port "$PORT" --log-level warning > "$LOG_FILE" 2>&1 < /dev/null &
WORKBENCH_PID=$!
echo "$WORKBENCH_PID" > "$PID_FILE"

# Wait until the HTTP server is accepting connections on $PORT (up to 10s).
for _ in $(seq 1 40); do
  if ! kill -0 "$WORKBENCH_PID" 2>/dev/null; then
    echo "× Failed to start the Cloud 101 Workbench. Recent log output:"
    cat "$LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
  fi
  if curl -s -o /dev/null "http://127.0.0.1:${PORT}/"; then
    break
  fi
  sleep 0.25
done

echo
echo "  Cloud 101 Workbench (running in background, PID ${WORKBENCH_PID})"
echo "  http://localhost:${PORT}"
echo "  Stop anytime with: ./scripts/stop.sh"
echo
