"""Putting a billing account on the student's project.

A billing account is a separate resource that a project is *linked* to, which
is the point step 2 is making. This does the linking, choosing the account the
way a workshop would: the credit you were given if you have one, otherwise
whichever open account you already have.

The project comes from ~/project_id.txt, written in step 1.
"""

from __future__ import annotations

import re
import subprocess
from typing import Any

from server.services import project

# "[2026-08-14] GDP Credit: 1234" -- ISO dates sort correctly as plain strings,
# so the newest credit wins without any date parsing.
CREDIT = re.compile(r"^\[(\d{4}-\d{2}-\d{2})\]\s*GDP\s+Credit:", re.IGNORECASE)


def _gcloud(*args: str, timeout: int = 60) -> tuple[int, str, str]:
    try:
        done = subprocess.run(["gcloud", *args], capture_output=True,
                              text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return 124, "", "timed out"
    except FileNotFoundError:
        return 127, "", "the gcloud command is not installed"
    return done.returncode, done.stdout.strip(), done.stderr.strip()


def _readable(error: str) -> str:
    """gcloud's failures run to a dozen lines. Say the useful part."""
    if "does not have required permission to use project" in error:
        return ("gcloud is billing these calls to a project this login cannot "
                "use. Check `gcloud config get-value billing/quota_project`.")
    if "PERMISSION_DENIED" in error or "does not have permission" in error:
        return "this login is not allowed to list billing accounts"
    first = next((line for line in error.splitlines() if line.strip()), "")
    return first.removeprefix("ERROR: ").strip()[:200]


def accounts() -> tuple[list[dict[str, str]], str]:
    """Every open billing account on this login, and why the list is empty.

    An empty list and a failed call are different things, and conflating them
    tells a student they have no billing when the truth may be that the call
    never ran.
    """
    code, out, error = _gcloud(
        "billing", "accounts", "list", "--filter=open=true",
        "--format=value(displayName,name)",
    )
    if code:
        return [], _readable(error)
    if not out:
        return [], ""

    found = []
    for line in out.splitlines():
        display, _, name = line.partition("\t")
        if not name:
            continue
        found.append({
            "display": display.strip(),
            "id": name.strip().removeprefix("billingAccounts/"),
        })
    return found, ""


def pick(available: list[dict[str, str]] | None = None) -> dict[str, str] | None:
    """The account to use: the newest credit if there is one, else the first
    open account. A personal card is a perfectly good answer."""
    available = accounts()[0] if available is None else available
    if not available:
        return None

    credits = sorted(
        (a for a in available if CREDIT.match(a["display"])),
        key=lambda a: a["display"],
        reverse=True,
    )
    chosen = credits[0] if credits else available[0]
    return {**chosen, "why": "your credit" if credits else "your open billing account"}


def _linked(project_id: str) -> tuple[bool, str]:
    code, out, _ = _gcloud(
        "billing", "projects", "describe", project_id,
        "--format=value(billingEnabled,billingAccountName)",
    )
    if code or not out:
        return False, ""
    enabled, _, account = out.partition("\t")
    return enabled.strip() == "True", account.strip().removeprefix("billingAccounts/")


def status() -> dict[str, Any]:
    project_id = project.remembered() or project.find()
    available, problem = accounts()
    choice = pick(available)

    enabled, account = (_linked(project_id) if project_id else (False, ""))
    named = next((a["display"] for a in available if a["id"] == account), account)

    return {
        "project": project_id,
        "enabled": enabled,
        "account": account,
        "accountName": named,
        "available": available,
        "candidate": choice,
        "problem": problem,
    }


def link() -> dict[str, Any]:
    now = status()

    if not now["project"]:
        return {**now, "ok": False,
                "detail": "no project yet — create one in step 1 first"}

    if now["enabled"]:
        return {**now, "ok": True, "detail": "already linked"}

    choice = now["candidate"]
    if not choice:
        if now.get("problem"):
            return {**now, "ok": False, "detail": now["problem"]}
        return {
            **now, "ok": False,
            "detail": ("No open billing account on this login. If you were given "
                       "a credit, claim it first — that is what creates the "
                       "billing account. Otherwise a free trial works: "
                       "https://console.cloud.google.com/freetrial"),
        }

    code, _, error = _gcloud(
        "billing", "projects", "link", now["project"],
        f"--billing-account={choice['id']}", timeout=90,
    )
    if code:
        return {**status(), "ok": False,
                "detail": error or "could not link the billing account"}

    return {**status(), "ok": True,
            "detail": f"linked {choice['display']} to {now['project']}"}
