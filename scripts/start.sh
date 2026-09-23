#!/usr/bin/env bash
# Start the workbench. Foreground: Ctrl+C stops it.
set -euo pipefail

cd "$(dirname "$0")/.."
PORT="${CLOUD101_PORT:-4800}"

if [ ! -d .venv ]; then
  echo "· creating the virtual environment"
  uv venv --quiet
fi
uv sync --quiet

if [ ! -d web/dist ]; then
  echo "· building the page"
  (cd web && npm install --silent && npm run build)
fi

echo
echo "  Cloud 101 Workbench"
echo "  http://localhost:${PORT}"
echo
exec uv run uvicorn server.main:app --host 0.0.0.0 --port "$PORT" --log-level warning
