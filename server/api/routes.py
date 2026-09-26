"""The workbench API.

One endpoint per question the page needs answered. Nothing here holds student
state: progress is derived from the world (did the project get created? does
the URL answer?), never stored, so a student who reloads, switches machines, or
rejoins tomorrow is exactly where their cloud account says they are.
"""

from __future__ import annotations

import asyncio
import json
import os
from typing import Any

from fastapi import APIRouter, Body, HTTPException, Request
from fastapi.responses import Response, StreamingResponse

from server.services import (apis, appproc, billing, budget, content,
                             environment, intent, probes, project, runs,
                             workspace)

router = APIRouter(prefix="/api")


@router.get("/course")
def get_course() -> dict[str, Any]:
    steps = content.all_steps()
    return {
        "course": content.course(),
        "steps": [s.card() for s in steps],
        "totalMinutes": sum(s.minutes for s in steps),
    }


@router.get("/steps/{slug}")
def get_step(slug: str) -> dict[str, Any]:
    found = content.step(slug)
    if not found:
        raise HTTPException(404, f"no step named {slug}")
    return found.full()


@router.get("/env")
def get_env(refresh: bool = False) -> dict[str, Any]:
    return environment.discover(force=refresh)


@router.post("/check/{slug}")
def check_step(slug: str, part: str | None = None) -> dict[str, Any]:
    found = content.step(slug)
    if not found:
        raise HTTPException(404, f"no step named {slug}")

    # Checking is also the moment to make sure the project id is on disk: the
    # student may have made it a way the workbench did not see.
    project.ensure_recorded()

    substitutions = environment.as_substitutions()
    specs = content.checks_for(slug, part)
    results = [probes.evaluate(spec, substitutions) for spec in specs]
    return {
        "slug": slug,
        "results": results,
        "passed": all(r["passed"] for r in results) if results else True,
        "env": environment.discover(force=True),
    }


@router.post("/check/{slug}/{check_id}")
def check_one(slug: str, check_id: str) -> dict[str, Any]:
    spec = content.check_spec(slug, check_id)
    if not spec:
        raise HTTPException(404, f"no check {check_id} in {slug}")
    return probes.evaluate(spec, environment.as_substitutions())


@router.post("/run/{slug}/{task_id}")
def start_run(slug: str, task_id: str) -> dict[str, Any]:
    task = content.task_spec(slug, task_id)
    if not task:
        raise HTTPException(404, f"no task {task_id} in {slug}")
    if task.get("kind") != "command":
        raise HTTPException(400, f"task {task_id} is not a command")

    token = runs.start(slug, task_id, task["command"], environment.as_substitutions())
    return {"token": token}


@router.post("/intent/{slug}/{task_id}")
def submit_intent(slug: str, task_id: str,
                  utterance: str = Body(..., embed=True)) -> dict[str, Any]:
    """The student says what they want. If that is what the step asked for, the
    command runs in their shell -- they never see it until afterwards."""
    task = content.task_spec(slug, task_id)
    if not task:
        raise HTTPException(404, f"no task {task_id} in {slug}")
    # `provision`, `deploy` and a `files` task with an `expect` are intents
    # too: they differ in how the page presents them, not in how they are judged.
    if task.get("kind") not in {"intent", "provision", "deploy", "files"} \
            or not task.get("expect"):
        raise HTTPException(400, f"task {task_id} does not take an intent")

    verdict = intent.resolve(utterance, task.get("expect") or {},
                             {"slug": slug, "task": task_id})

    if not verdict["ok"]:
        return {**verdict, "token": None, "command": None}

    command = task.get("command")
    if not command:
        return {**verdict, "token": None, "command": None}

    # What the student said becomes the command's arguments.
    substitutions = {**environment.as_substitutions(), **verdict.get("captured", {})}
    token = runs.start(slug, task_id, command, substitutions)
    return {**verdict, "token": token, "command": runs.fill(command, substitutions)}


@router.get("/run/{token}")
def run_status(token: str) -> dict[str, Any]:
    record = runs.status(token)
    if not record:
        raise HTTPException(404, "unknown run")
    # The log is the source of truth once a run ends: the proxy may have eaten
    # stream lines, the file never lies.
    return {**record, "log": runs.read_log(token)}


@router.get("/files/tree")
def files_tree(start: str = "", depth: int = 3) -> dict[str, Any]:
    try:
        return workspace.tree(start, depth)
    except workspace.OutsideWorkspace:
        raise HTTPException(400, "outside the project")


@router.get("/files/read")
def files_read(path: str) -> dict[str, Any]:
    try:
        return workspace.read(path)
    except workspace.OutsideWorkspace:
        raise HTTPException(400, "outside the project")


@router.post("/shell")
def shell(line: str = Body(..., embed=True),
          cwd: str = Body("", embed=True)) -> dict[str, Any]:
    """One command from the terminal panel. Not a shell: see workspace.run."""
    try:
        return workspace.run(line, cwd)
    except workspace.OutsideWorkspace:
        raise HTTPException(400, "outside the project")


@router.get("/project")
def project_status() -> dict[str, Any]:
    return project.status()


@router.post("/project/create")
def project_create() -> dict[str, Any]:
    """Make the project on the student's behalf."""
    return project.create()


@router.post("/project/confirm")
def project_confirm() -> dict[str, Any]:
    """They say they made it; look for it and write the id down."""
    return project.confirm()


@router.post("/project/delete")
def project_delete(body: dict = Body(default={})) -> dict[str, Any]:
    """Shut down the course's project. Only ever reached from the cleanup step."""
    return project.shut_down(str(body.get("project", "")).strip())


@router.get("/billing")
def billing_status() -> dict[str, Any]:
    return billing.status()


@router.post("/billing/link")
def billing_link() -> dict[str, Any]:
    """Attach a billing account to the project recorded in step 1."""
    return billing.link()


@router.get("/services")
def services_status() -> dict[str, Any]:
    return apis.status()


@router.post("/services/enable")
def services_enable() -> dict[str, Any]:
    """Switch on everything the course needs, for a student skipping the console."""
    return apis.enable()


@router.get("/budget")
def budget_status() -> dict[str, Any]:
    return budget.status()


@router.post("/budget/create")
def budget_create() -> dict[str, Any]:
    """Create the budget alert for a student who would rather not click."""
    return budget.create()


@router.get("/service")
def service_url() -> dict[str, Any]:
    """Where the deployed app lives, if it has been deployed.

    The page needs this after a deployment: to link to the app, and to put the
    address in the message the student shares.
    """
    env = environment.as_substitutions()
    name = os.environ.get("CLOUD101_SERVICE", "dinoquest")
    found = probes.run_probe(
        f"gcloud run services describe {name} "
        f"--region={env['REGION']} --format=value(status.url)",
        env,
    )
    address = (found.get("out") or "").strip()
    return {"url": address if address.startswith("https://") else "",
            "service": name, "region": env["REGION"]}


@router.get("/app/status")
def app_status() -> dict[str, Any]:
    return appproc.status()


@router.post("/app/start")
def app_start() -> dict[str, Any]:
    return appproc.start()


@router.post("/app/reset")
def app_reset() -> dict[str, Any]:
    """Rewind app/ to the state the course starts from. Touches no cloud
    resources -- only the code."""
    import subprocess

    from server import config

    done = subprocess.run(
        ["python3", "scripts/reset_app.py"], cwd=config.ROOT,
        capture_output=True, text=True, timeout=120,
    )
    return {
        "ok": done.returncode == 0,
        "detail": (done.stdout or done.stderr).strip()[-400:],
    }


@router.post("/app/stop")
def app_stop() -> dict[str, Any]:
    return appproc.stop()


@router.get("/app/log")
def app_log() -> dict[str, Any]:
    return {"log": appproc.read_log()}


@router.get("/events")
async def events(request: Request) -> StreamingResponse:
    queue = runs.subscribe()

    async def stream():
        # Cloud Shell's proxy will not flush a response until it has a couple of
        # kilobytes, so the stream opens with padding it can keep.
        yield ":" + " " * 2048 + "\n\n"
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=10)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        finally:
            runs.unsubscribe(queue)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
