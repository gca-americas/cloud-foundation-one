#!/usr/bin/env bash
# Stop the background Cloud 101 Workbench (and any running student app process).
set -euo pipefail

cd "$(dirname "$0")/.."
PID_FILE="runs/workbench.pid"
APP_PID_FILE="runs/app.pid"
STOPPED=0

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
    STOPPED=1
  fi
  rm -f "$PID_FILE"
fi

if pkill -f "uvicorn server.main:app" 2>/dev/null; then
  STOPPED=1
fi

if [ -f "$APP_PID_FILE" ]; then
  APP_PID="$(cat "$APP_PID_FILE" 2>/dev/null || true)"
  if [ -n "$APP_PID" ] && kill -0 "$APP_PID" 2>/dev/null; then
    kill "$APP_PID" 2>/dev/null || true
  fi
  rm -f "$APP_PID_FILE"
fi

if [ "$STOPPED" -eq 1 ]; then
  echo "· stopped Cloud 101 Workbench"
else
  echo "· Cloud 101 Workbench is not running"
fi
