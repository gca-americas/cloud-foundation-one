"""The Cloud 101 Workbench server.

Serves the API and, in production, the built page. In development the Vite dev
server proxies /api here instead.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from fastapi import Request
from fastapi.responses import Response

from server import config
from server.api.routes import router
from server.services import appproc, runs


@asynccontextmanager
async def lifespan(app: FastAPI):
    runs.bind_loop(asyncio.get_running_loop())
    yield


app = FastAPI(title="Cloud 101 Workbench", lifespan=lifespan)
app.include_router(router)


@app.api_route("/app", methods=["GET"])
@app.api_route("/app/{path:path}", methods=["GET", "POST"])
async def student_app(request: Request, path: str = "") -> Response:
    """Everything under /app is the student's app, running in its own process.

    Served through here rather than framed directly so the iframe is
    same-origin and only one port needs to be reachable.
    """
    if not request.url.path.endswith("/") and path == "":
        return Response(status_code=307, headers={"Location": "/app/"})

    body = await request.body() if request.method == "POST" else None
    status, payload, headers = appproc.proxy(
        path or "/", request.method, body, dict(request.headers)
    )
    headers.pop("Content-Length", None)
    return Response(content=payload, status_code=status, headers=headers)


if (config.ROOT / "img").exists():
    app.mount("/img", StaticFiles(directory=config.ROOT / "img"), name="img")

if config.WEB_DIST.exists():
    app.mount("/assets", StaticFiles(directory=config.WEB_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        """Every unknown path is a page route: hand back the shell and let the
        router sort it out."""
        candidate = config.WEB_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(config.WEB_DIST / "index.html")
