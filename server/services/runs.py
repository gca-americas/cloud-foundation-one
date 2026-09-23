"""Running an exercise command and streaming it to the page.

The safety model is simple and worth stating: the page cannot send a command.
It sends a step slug and a task id, and the server looks the command up in the
content. Whatever a browser asks for, the only things that can run are the
commands an author wrote into a step.yaml.

Cloud Shell sits behind a buffering proxy, so the stream opens with padding and
heartbeats, and the page re-fetches the whole log when a run ends rather than
trusting that every line arrived. Both of those are load-bearing.
"""

from __future__ import annotations

import asyncio
import os
import re
import shlex
import subprocess
import threading
import time
from typing import Any

from server import config

_subscribers: list[asyncio.Queue] = []
_loop: asyncio.AbstractEventLoop | None = None
_runs: dict[str, dict[str, Any]] = {}
_lock = threading.Lock()


def bind_loop(loop: asyncio.AbstractEventLoop) -> None:
    global _loop
    _loop = loop


def subscribe() -> asyncio.Queue:
    queue: asyncio.Queue = asyncio.Queue()
    _subscribers.append(queue)
    return queue


def unsubscribe(queue: asyncio.Queue) -> None:
    if queue in _subscribers:
        _subscribers.remove(queue)


def publish(event: dict[str, Any]) -> None:
    """Called from the worker thread; hops onto the event loop to fan out."""
    if _loop is None:
        return
    for queue in list(_subscribers):
        _loop.call_soon_threadsafe(queue.put_nowait, event)


def _substitute(command: str, env: dict[str, str]) -> str:
    def one(match: re.Match[str]) -> str:
        return env.get(match.group(1) or match.group(2), "")

    return re.sub(r"\$\{(\w+)\}|\$(\w+)", one, command)


def log_path(token: str) -> "os.PathLike[str]":
    return config.RUNS / f"{token}.log"


def status(token: str) -> dict[str, Any] | None:
    with _lock:
        record = _runs.get(token)
        return dict(record) if record else None


def read_log(token: str) -> str:
    path = log_path(token)
    return path.read_text() if os.path.exists(path) else ""


def fill(command: str, env: dict[str, str]) -> str:
    """The command with its variables resolved -- what the student should be
    shown, rather than the template an author wrote."""
    return _substitute(command, env)


def start(slug: str, task_id: str, command: str, env: dict[str, str]) -> str:
    """Spawn the task. Returns a token the page uses to follow and to settle up.

    The token exists because in Cloud Shell the browser and the server are
    different machines: comparing clocks to decide whether a run finished
    reports false endings, so every line and the exit record carry the token.
    """
    token = f"{slug}.{task_id}.{int(time.time() * 1000)}"
    filled = _substitute(command, env)

    with _lock:
        _runs[token] = {"token": token, "slug": slug, "task": task_id,
                        "command": filled, "state": "running", "code": None}

    thread = threading.Thread(target=_pump, args=(token, filled), daemon=True)
    thread.start()
    return token


def _pump(token: str, command: str) -> None:
    path = log_path(token)
    publish({"type": "run.start", "token": token, "command": command})

    with open(path, "w", encoding="utf-8") as sink:
        sink.write(f"$ {command}\n")
        sink.flush()
        publish({"type": "run.line", "token": token, "line": f"$ {command}"})

        try:
            proc = subprocess.Popen(
                shlex.split(command),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                env={**os.environ, "CLOUDSDK_CORE_DISABLE_PROMPTS": "1",
                     "PYTHONUNBUFFERED": "1"},
            )
        except FileNotFoundError as missing:
            line = f"not found: {missing}"
            sink.write(line + "\n")
            publish({"type": "run.line", "token": token, "line": line})
            _finish(token, 127)
            return

        assert proc.stdout is not None
        for line in proc.stdout:
            line = line.rstrip("\n")
            sink.write(line + "\n")
            sink.flush()
            publish({"type": "run.line", "token": token, "line": line})

        code = proc.wait()

    _finish(token, code)


def _finish(token: str, code: int) -> None:
    with _lock:
        if token in _runs:
            _runs[token].update(state="done", code=code)
    publish({"type": "run.done", "token": token, "code": code})
