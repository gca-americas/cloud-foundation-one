"""What the workbench knows about the student's setup.

Discovered by asking gcloud, never configured by hand, so the page always
reflects the terminal the student is actually working in. Everything here is
optional: step 0 and step 1 run fine before any of it exists, which is the
point -- the course starts before the account does.
"""

from __future__ import annotations

import subprocess
import time
from pathlib import Path
from typing import Any

_CACHE: dict[str, Any] = {"at": 0.0, "value": None}
_TTL = 5.0


def _gcloud(*args: str) -> str:
    try:
        proc = subprocess.run(
            ["gcloud", *args], capture_output=True, text=True, timeout=20,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return ""
    value = proc.stdout.strip()
    # gcloud prints this rather than an empty string when a property is unset.
    return "" if value == "(unset)" else value


def discover(force: bool = False) -> dict[str, Any]:
    now = time.time()
    if not force and _CACHE["value"] is not None and now - _CACHE["at"] < _TTL:
        return _CACHE["value"]

    account = _gcloud("config", "get-value", "account")
    project = _gcloud("config", "get-value", "project")
    region = _gcloud("config", "get-value", "run/region")

    value = {
        "account": account,
        "project": project,
        "region": region,
        "hasGcloud": bool(_gcloud("version")),
        "signedIn": bool(account),
        "hasProject": bool(project),
    }
    _CACHE.update(at=now, value=value)
    return value


def as_substitutions() -> dict[str, str]:
    """The variables a probe or a task command may reference."""
    from server.services import project  # late, to avoid an import cycle

    env = discover()
    return {
        "PROJECT_NAME": project.PREFIX,
        "PROJECT": env["project"],
        "PROJECT_ID": env["project"],
        "ACCOUNT": env["account"],
        "REGION": env["region"] or "us-central1",
        "HOME": str(Path.home()),
    }
