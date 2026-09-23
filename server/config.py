"""Paths, ports, and the handful of environment values the workbench reads.

Nothing here talks to Google Cloud. The workbench learns the student's project
the same way they do: by asking gcloud (see services/probes.py).
"""

from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
STEPS = CONTENT / "steps"
WEB_DIST = ROOT / "web" / "dist"
RUNS = ROOT / "runs"

PORT = int(os.environ.get("CLOUD101_PORT", "4800"))

# Written by scripts/start.sh so the page can show where it is running.
HOST_HINT = os.environ.get("CLOUD101_HOST_HINT", "")

RUNS.mkdir(exist_ok=True)
