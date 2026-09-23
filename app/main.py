"""DinoQuest — the app this course moves to the cloud.

It serves the game and keeps the leaderboard. Right now the leaderboard is a
Python list, which means it lives in this process and nowhere else: stop the
server and every score is gone. That is not a bug to fix later, it is the
first thing the course asks you to notice.

No dependencies. Python's standard library serves the page and answers the
two API calls, so `python3 main.py` is the whole setup.

  GET  /              the game
  GET  /api/scores    the leaderboard, best first
  POST /api/scores    {"name": "...", "score": 123}
"""

from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
STATIC = HERE / "static"


def load_env(path: Path = HERE / ".env") -> None:
    """Read KEY=value lines into the environment, if the file is there.

    Settings that change between machines do not belong in the source. They
    go in a file the code reads at startup, and that file is not committed.
    Step 6 writes it.
    """
    if not path.is_file():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"'))


load_env()

PORT = int(os.environ.get("PORT", "8080"))
KEEP = 10          # how many scores the leaderboard shows
MAX_NAME = 12

# ── the leaderboard ──────────────────────────────────────────── begin store ──
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

# ──────────────────────────────────────────────────────────────── end store ──


# ── the dino ───────────────────────────────────────────────── begin dino ──
#
# The dino is a picture in static/dino.png. Right now it is the one that
# shipped with the game and there is no way to change it. Step 6 asks a model
# to draw a new one.

DINO_READY = False


def make_dino(idea: str) -> dict:
    """Draw a new dino. Nothing does yet."""
    return {"ok": False, "detail": "no model is wired up yet — step 6 does that"}


def restore_dino() -> dict:
    """Put the dino that shipped with the game back. Nothing to put back yet."""
    return {"ok": False, "detail": "no model is wired up yet — step 6 does that"}

# ─────────────────────────────────────────────────────────────── end dino ──


# ─────────────────────────────────────────────────────────────────────────────
# The web server
# ─────────────────────────────────────────────────────────────────────────────

TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
}


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status: int, payload) -> None:
        self._send(status, json.dumps(payload).encode(), "application/json")

    def _file(self, name: str) -> None:
        path = (STATIC / name).resolve()
        # Everything served comes from static/, whatever the URL asks for.
        if not path.is_file() or STATIC not in path.parents:
            self._send(404, b"not found", "text/plain; charset=utf-8")
            return
        self._send(200, path.read_bytes(), TYPES.get(path.suffix, "application/octet-stream"))

    def do_GET(self) -> None:  # noqa: N802 - http.server's spelling
        route = self.path.split("?", 1)[0]

        if route == "/":
            self._file("index.html")
        elif route == "/api/scores":
            self._json(200, leaderboard())
        elif route == "/api/health":
            self._json(200, {"ok": True, "where": WHERE, "dino": DINO_READY})
        else:
            self._file(route.lstrip("/"))

    def do_POST(self) -> None:  # noqa: N802
        route = self.path.split("?", 1)[0]

        if route == "/api/dino/original":
            outcome = restore_dino()
            self._json(200 if outcome.get("ok") else 503, outcome)
            return

        if route == "/api/dino":
            length = int(self.headers.get("Content-Length") or 0)
            try:
                sent = json.loads(self.rfile.read(length) or b"{}")
                idea = str(sent.get("idea", "")).strip()[:200]
            except (ValueError, TypeError):
                self._json(400, {"error": "expected {idea}"})
                return
            outcome = make_dino(idea)
            self._json(200 if outcome.get("ok") else 503, outcome)
            return

        if route != "/api/scores":
            self._send(404, b"not found", "text/plain; charset=utf-8")
            return

        length = int(self.headers.get("Content-Length") or 0)
        try:
            sent = json.loads(self.rfile.read(length) or b"{}")
            name = str(sent.get("name", "anon")).strip()
            score = int(sent.get("score", 0))
        except (ValueError, TypeError):
            self._json(400, {"error": "expected {name, score}"})
            return

        self._json(200, add_score(name, max(0, score)))

    def log_message(self, fmt: str, *args) -> None:
        print(f"  {fmt % args}", flush=True)


def main() -> None:
    print(f"DinoQuest is running on http://localhost:{PORT}", flush=True)
    print("open it with Web Preview at the top of the Cloud Shell window\n", flush=True)
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
