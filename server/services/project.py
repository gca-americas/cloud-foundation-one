"""Finding, creating and remembering the student's project.

Step 1 asks for a project called `my-dinoquest`. A student can make it
themselves in the console, or press a button and have it made for them; either
way the workbench then confirms it exists and writes the id to
`~/project_id.txt`, which every later step reads.

Project ids are globally unique, so `my-dinoquest` itself is almost certainly
taken. What gets created is `my-dinoquest-NNNN`, with the display name left as
`my-dinoquest` -- which is the lesson of step 3 arriving a step early, and the
reason the checks match on a prefix rather than an exact id.
"""

from __future__ import annotations

import json
import os
import random
import subprocess
from pathlib import Path
from typing import Any

# The course asks for `my-dinoquest`. Accounts that cannot create projects, or
# that must reuse an existing one, set CLOUD101_PROJECT_NAME instead -- the
# panel, the instructions and the checks all follow it.
PREFIX = os.environ.get("CLOUD101_PROJECT_NAME", "my-dinoquest").strip() or "my-dinoquest"
RECORD = Path.home() / "project_id.txt"
ATTEMPTS = 4


def _gcloud(*args: str, timeout: int = 90) -> tuple[int, str, str]:
    try:
        done = subprocess.run(["gcloud", *args], capture_output=True,
                              text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return 124, "", "timed out"
    except FileNotFoundError:
        return 127, "", "the gcloud command is not installed"
    return done.returncode, done.stdout.strip(), done.stderr.strip()


def remembered() -> str:
    try:
        return RECORD.read_text().strip()
    except OSError:
        return ""


def remember(project_id: str) -> None:
    """Write the id where the rest of the course looks for it."""
    RECORD.write_text(project_id + "\n")


def ensure_recorded() -> str:
    """Find the course's project and write the id down if it is not already.

    Everything downstream reads ~/project_id.txt -- the deployment, the model
    settings, and the Firestore client. A student who made the project some
    other way, or who lost the file, would otherwise carry an empty value all
    the way to a client library building requests against no project at all.

    Cheap to call: it only writes when the answer changes.
    """
    project_id = find()
    if project_id and project_id != remembered():
        remember(project_id)
    return project_id


def find() -> str:
    """The student's project, if it exists. Matches on the prefix, because the
    id they end up with carries digits the name does not."""
    code, out, _ = _gcloud(
        "projects", "list",
        f"--filter=projectId:{PREFIX}*",
        "--format=json", "--limit=10",
    )
    if code or not out:
        return ""
    try:
        found = json.loads(out)
    except json.JSONDecodeError:
        return ""
    if not found:
        return ""
    # Newest first, so a second attempt wins over an abandoned first one.
    found.sort(key=lambda item: item.get("createTime", ""), reverse=True)
    return found[0].get("projectId", "")


def status() -> dict[str, Any]:
    code, account, _ = _gcloud("config", "get-value", "account", timeout=20)
    code, active, _ = _gcloud("config", "get-value", "project", timeout=20)
    project = find()
    return {
        "signedIn": bool(account) and account != "(unset)",
        "account": account if account != "(unset)" else "",
        "project": project,
        "active": active if active != "(unset)" else "",
        "recorded": remembered(),
        "name": PREFIX,
    }


def _adopt(project_id: str) -> dict[str, Any]:
    """Make a project the active one and write it down."""
    _gcloud("config", "set", "project", project_id, timeout=30)
    remember(project_id)
    return {**status(), "project": project_id, "detail": "ready"}


def confirm() -> dict[str, Any]:
    """The student says they made it. Check, rather than believe."""
    project_id = find()
    if not project_id:
        return {
            **status(),
            "detail": f"no project starting with {PREFIX} yet",
            "ok": False,
        }
    return {**_adopt(project_id), "ok": True}


def create() -> dict[str, Any]:
    """Make the project for them. Ids are globally unique, so collisions are
    normal and retried rather than reported."""
    existing = find()
    if existing:
        return {**_adopt(existing), "ok": True, "detail": "it already exists"}

    last = ""
    for _ in range(ATTEMPTS):
        candidate = f"{PREFIX}-{random.randint(1000, 9999)}"
        code, _, error = _gcloud(
            "projects", "create", candidate, f"--name={PREFIX}", timeout=120,
        )
        if code == 0:
            return {**_adopt(candidate), "ok": True, "detail": f"created {candidate}"}
        last = error
        if "already in use" not in error and "already exists" not in error:
            break

    return {**status(), "ok": False,
            "detail": last or "could not create the project"}


def shut_down(project_id: str) -> dict[str, Any]:
    """Delete the project, for a student who would rather not use the console.

    The terminal refuses `projects delete` on purpose, and that stays true:
    nothing a student types can do this. This runs only when they ask for it
    from the cleanup step, and only for the project the course recorded, so a
    mistyped id cannot take something else with it.

    Deletion is reversible for 30 days. It is not a backup, and the step says
    so.
    """
    expected = remembered() or find()
    if not expected:
        return {"ok": False, "detail": "no project is recorded for this course"}
    if project_id != expected:
        return {"ok": False,
                "detail": f"that is not the project this course made ({expected})"}

    code, _, error = _gcloud("projects", "delete", project_id, "--quiet", timeout=180)
    if code:
        first = (error.splitlines() or [""])[0][:200]
        return {"ok": False, "detail": first or "could not delete the project"}

    return {"ok": True, "project": project_id,
            "detail": f"{project_id} is scheduled for deletion, recoverable for 30 days"}
