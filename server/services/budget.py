"""Putting a budget alert on the student's billing account.

Step 2 asks for one in the console, because seeing the billing pages is worth
something. This is the other door: a button that does the same thing for
anyone who would rather not go looking.

Two details make this more than one command. The Budget API is not enabled in
a new project, and `gcloud billing budgets` offers to enable it by asking a
y/N question -- which would hang a workbench with no keyboard. So the API is
enabled first, explicitly, with prompts disabled.
"""

from __future__ import annotations

import json
import os
import subprocess
from typing import Any

from server.services import billing

API = "billingbudgets.googleapis.com"
AMOUNT = "10USD"
THRESHOLDS = ["percent=0.5", "percent=0.9", "percent=1.0"]


def _gcloud(*args: str, timeout: int = 120) -> tuple[int, str, str]:
    try:
        done = subprocess.run(
            ["gcloud", *args, "--quiet"], capture_output=True, text=True,
            timeout=timeout,
            # Without this, gcloud stops to ask whether to enable an API.
            env={**os.environ, "CLOUDSDK_CORE_DISABLE_PROMPTS": "1"},
        )
    except subprocess.TimeoutExpired:
        return 124, "", "timed out"
    except FileNotFoundError:
        return 127, "", "the gcloud command is not installed"
    return done.returncode, done.stdout.strip(), done.stderr.strip()


def _readable(error: str) -> str:
    """gcloud's failures are long. Say the useful part."""
    if "SERVICE_DISABLED" in error or "has not been used in project" in error:
        return "the Budget API is not enabled on this project yet"
    if "does not have permission" in error or "PERMISSION_DENIED" in error:
        return ("this login cannot manage budgets on that billing account — "
                "an administrator owns it")
    first = next((line for line in error.splitlines() if line.strip()), "")
    return first.removeprefix("ERROR: ").strip()[:240] or "it did not work"


def _budgets(account: str) -> tuple[list[dict[str, Any]], str]:
    code, out, error = _gcloud(
        "billing", "budgets", "list", f"--billing-account={account}",
        "--format=json", timeout=60,
    )
    if code:
        return [], _readable(error)
    try:
        return json.loads(out) if out else [], ""
    except json.JSONDecodeError:
        return [], "could not read the budget list"


def status() -> dict[str, Any]:
    where = billing.status()
    account = where["account"]
    project_id = where["project"]

    if not account:
        return {"project": project_id, "account": "", "budgets": [],
                "count": 0, "ready": False,
                "detail": "link a billing account first"}

    found, problem = _budgets(account)
    return {
        "project": project_id,
        "account": account,
        "accountName": where["accountName"],
        "budgets": [b.get("displayName", "(unnamed)") for b in found],
        "count": len(found),
        "ready": bool(account),
        "detail": problem,
    }


def create() -> dict[str, Any]:
    where = billing.status()
    account = where["account"]
    project_id = where["project"]

    if not project_id:
        return {**status(), "ok": False, "detail": "no project yet"}
    if not account:
        return {**status(), "ok": False,
                "detail": "this project has no billing account yet"}

    # The API first, or the create command stops to ask about it.
    code, _, error = _gcloud("services", "enable", API, timeout=180)
    if code:
        return {**status(), "ok": False,
                "detail": f"could not enable the Budget API: {_readable(error)}"}

    existing, problem = _budgets(account)
    if problem:
        return {**status(), "ok": False, "detail": problem}

    name = f"Cloud 101 · {project_id}"
    if any(b.get("displayName") == name for b in existing):
        return {**status(), "ok": True, "detail": "that budget already exists"}

    args = [
        "billing", "budgets", "create",
        f"--billing-account={account}",
        f"--display-name={name}",
        f"--budget-amount={AMOUNT}",
        f"--filter-projects=projects/{project_id}",
    ]
    for rule in THRESHOLDS:
        args.append(f"--threshold-rule={rule}")

    code, _, error = _gcloud(*args, timeout=120)
    if code:
        return {**status(), "ok": False, "detail": _readable(error)}

    return {**status(), "ok": True,
            "detail": f"created a {AMOUNT} budget on {project_id}, "
                      "alerting at 50%, 90% and 100%"}
