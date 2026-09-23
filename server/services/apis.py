"""The services this course needs switched on.

One list, in one place: the console checklist, the assist button and the
checks all read it, so adding a service later means editing this file rather
than hunting through content.
"""

from __future__ import annotations

import os
import subprocess
from typing import Any

REQUIRED: list[tuple[str, str]] = [
    ("run.googleapis.com", "somewhere to run your code"),
    ("cloudbuild.googleapis.com", "turns your source into a container"),
    ("artifactregistry.googleapis.com", "stores the built container"),
    ("firestore.googleapis.com", "the leaderboard, in step 5"),
    ("aiplatform.googleapis.com", "the model, in step 6"),
]


def _gcloud(*args: str, timeout: int = 240) -> tuple[int, str, str]:
    try:
        done = subprocess.run(
            ["gcloud", *args], capture_output=True, text=True, timeout=timeout,
            env={**os.environ, "CLOUDSDK_CORE_DISABLE_PROMPTS": "1"},
        )
    except subprocess.TimeoutExpired:
        return 124, "", "timed out"
    except FileNotFoundError:
        return 127, "", "the gcloud command is not installed"
    return done.returncode, done.stdout.strip(), done.stderr.strip()


def status() -> dict[str, Any]:
    code, out, error = _gcloud(
        "services", "list", "--enabled", "--format=value(config.name)", timeout=90,
    )
    on = set(out.split()) if code == 0 else set()

    return {
        "services": [
            {"name": name, "why": why, "enabled": name in on}
            for name, why in REQUIRED
        ],
        "missing": [name for name, _ in REQUIRED if name not in on],
        "ok": code == 0,
        "detail": "" if code == 0 else error.splitlines()[0][:200],
    }


def enable() -> dict[str, Any]:
    now = status()
    if now["ok"] and not now["missing"]:
        return {**now, "detail": "they are all on already"}

    wanted = now["missing"] or [name for name, _ in REQUIRED]
    code, _, error = _gcloud("services", "enable", *wanted)
    if code:
        return {**status(), "detail": error.splitlines()[0][:240] or "could not enable them"}

    after = status()
    return {**after,
            "detail": f"enabled {len(wanted)} service{'s' if len(wanted) != 1 else ''}"}
