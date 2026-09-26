"""Point the leaderboard at Firestore. Step 5.

Replaces one marked section of app/main.py. Everything else about the app --
the game, the routes, the two API calls -- is untouched, which is the point:
moving where the data lives did not mean rewriting the application.

Run again to no effect. Run with --undo to put the list back.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_DIR = ROOT / "app"
APP = APP_DIR / "main.py"
REQUIREMENTS = APP_DIR / "requirements.txt"

# The app gets its own virtual environment rather than installing into the
# system interpreter. Cloud Shell would tolerate `pip install --user`; a Mac
# with Homebrew Python refuses it outright, and a project with dependencies
# should have somewhere to put them anyway.
VENV = APP_DIR / ".venv"
VENV_PYTHON = VENV / "bin" / "python"

BEGIN = "# ── the leaderboard ──────────────────────────────────────────── begin store ──"
END = "# ──────────────────────────────────────────────────────────────── end store ──"

IN_MEMORY = '''
#
# This list is the entire database. It exists in this process's memory, so it
# is empty every time the server starts, and it is not shared with anyone else
# running the game. Step 5 replaces it.

WHERE = "in this process's memory"

SCORES: list[dict] = []


def add_score(name: str, score: int) -> list[dict]:
    """Record a score and return the leaderboard."""
    SCORES.append({"name": name[:MAX_NAME] or "anon", "score": score})
    SCORES.sort(key=lambda row: row["score"], reverse=True)
    del SCORES[KEEP:]
    return SCORES


def leaderboard() -> list[dict]:
    return SCORES
'''

FIRESTORE = '''
#
# The leaderboard now lives in Firestore: a managed database, in the region you
# chose, outside this process. Stop the server and the scores stay where they
# are. Nothing else in this file changed.

from google.cloud import firestore          # noqa: E402

COLLECTION = "scores"


def _project() -> str:
    """Which project to write to.

    Named explicitly, and this matters. firestore.Client() with no project
    falls back to Application Default Credentials, which is a different
    credential from the one `gcloud config set project` changes and is often a
    different account altogether. When the two disagree the writes succeed --
    into somebody else's project -- and nothing here would say so.
    """
    named = os.environ.get("GOOGLE_CLOUD_PROJECT", "").strip()
    if named:
        return named

    saved = Path.home() / "project_id.txt"
    if saved.is_file() and saved.read_text().strip():
        return saved.read_text().strip()

    return ""


PROJECT = _project()
WHERE = f"in Firestore ({PROJECT})" if PROJECT else "in Firestore"

# No project means every request is built against "projects//databases/..."
# and Firestore rejects it with "Invalid resource field value in the request",
# which says nothing about the cause. Say it here instead, once, plainly.
if not PROJECT:
    print("  no project id: set GOOGLE_CLOUD_PROJECT, or complete step 2 so that",
          flush=True)
    print("  ~/project_id.txt exists. Firestore cannot be reached without one.",
          flush=True)

_db = firestore.Client(project=PROJECT) if PROJECT else firestore.Client()

print(f"  leaderboard: Firestore in project {_db.project!r}", flush=True)


def add_score(name: str, score: int) -> list[dict]:
    """Record a score and return the leaderboard."""
    _db.collection(COLLECTION).add({"name": name[:MAX_NAME] or "anon", "score": score})
    return leaderboard()


def leaderboard() -> list[dict]:
    rows = (
        _db.collection(COLLECTION)
        .order_by("score", direction=firestore.Query.DESCENDING)
        .limit(KEEP)
        .stream()
    )
    return [{"name": r.get("name"), "score": r.get("score")} for r in rows]
'''

CLIENT = "google-cloud-firestore"


def swap(to_firestore: bool) -> bool:
    source = APP.read_text()
    start = source.find(BEGIN)
    end = source.find(END)
    if start == -1 or end == -1:
        print("could not find the store section in app/main.py")
        return False

    wanted = FIRESTORE if to_firestore else IN_MEMORY
    already = "firestore.Client()" in source
    if already == to_firestore:
        print(f"the leaderboard is already {'in Firestore' if to_firestore else 'in memory'}")
        return True

    APP.write_text(source[:start] + BEGIN + wanted + "\n" + source[end:])
    print(f"app/main.py now keeps scores {'in Firestore' if to_firestore else 'in memory'}")
    return True


def requirements(to_firestore: bool) -> None:
    lines = [
        line for line in REQUIREMENTS.read_text().splitlines()
        if line.strip() and not line.startswith(CLIENT)
    ]
    if to_firestore:
        lines = [line for line in lines if not line.startswith("#")]
        lines.append(CLIENT)
    else:
        lines = ["# No dependencies yet. Step 5 adds the Firestore client."]
    REQUIREMENTS.write_text("\n".join(lines) + "\n")


def installed() -> bool:
    if not VENV_PYTHON.exists():
        return False
    done = subprocess.run(
        [str(VENV_PYTHON), "-c", "import google.cloud.firestore"],
        capture_output=True, text=True,
    )
    return done.returncode == 0


def install() -> None:
    """Give the app a virtual environment and put the client in it."""
    if installed():
        print("the Firestore client library is already installed")
        return

    if not VENV_PYTHON.exists():
        print("creating app/.venv", flush=True)
        made = subprocess.run(
            [sys.executable, "-m", "venv", str(VENV)], capture_output=True, text=True,
        )
        if made.returncode:
            print(made.stderr.strip().splitlines()[-1][:200] if made.stderr else "venv failed")
            return

    print(f"installing {CLIENT} into app/.venv (this takes a minute)", flush=True)
    done = subprocess.run(
        [str(VENV_PYTHON), "-m", "pip", "install", "--quiet", CLIENT],
        capture_output=True, text=True,
    )
    if done.returncode:
        print(done.stderr.strip().splitlines()[-1][:220] if done.stderr else "pip failed")
        print("the app will not start until the client is installed")
        return

    print("installed")


def main() -> int:
    undo = "--undo" in sys.argv
    if not swap(to_firestore=not undo):
        return 1
    requirements(to_firestore=not undo)
    if not undo:
        install()
    print("\nRestart the app to pick it up.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
