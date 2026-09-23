#!/usr/bin/env bash
# Development: API on 4700, Vite with hot reload on 5273.
set -euo pipefail

cd "$(dirname "$0")/.."
uv run uvicorn server.main:app --port 4800 --reload --log-level warning &
API=$!
trap 'kill $API 2>/dev/null || true' EXIT
cd web && npm run dev
