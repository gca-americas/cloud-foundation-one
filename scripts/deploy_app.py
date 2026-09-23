"""Put DinoQuest on Cloud Run. Step 7.

One command deploys, but a deployment that works needs three things the
command alone does not give it:

  1. Permission. Locally the app called Firestore and Gemini as *you*, and you
     already had access. Deployed, it runs as a service account that has been
     granted nothing.
  2. Settings. app/.env is a local file and is not in the container. The same
     values have to be set on the service itself.
  3. The source. Cloud Run builds the container from app/ -- there is no
     Dockerfile, because the buildpack reads Procfile and requirements.txt.

Run again to deploy a new revision. The URL does not change.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_DIR = ROOT / "app"
ENV_FILE = APP_DIR / ".env"

SERVICE = os.environ.get("CLOUD101_SERVICE", "dinoquest")

# What the deployed app needs in its environment. GOOGLE_CLOUD_PROJECT is
# already there -- Cloud Run sets it -- so it is not repeated here.
CARRY = ["GOOGLE_GENAI_USE_VERTEXAI", "GOOGLE_CLOUD_LOCATION", "DINO_MODEL"]

# The roles the running service needs, and the reason for each.
ROLES = [
    ("roles/datastore.user", "read and write the leaderboard in Firestore"),
    ("roles/aiplatform.user", "call Gemini for a dino"),
]


def run(*args: str, timeout: int = 600) -> tuple[int, str, str]:
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


def setting(name: str) -> str:
    code, out, _ = run("config", "get-value", name, timeout=60)
    return out if code == 0 and out and out != "(unset)" else ""


def project_id() -> str:
    saved = Path.home() / "project_id.txt"
    if saved.is_file() and saved.read_text().strip():
        return saved.read_text().strip()
    return setting("project")


def env_values() -> dict[str, str]:
    """The settings step 6 wrote, so the deployed app gets the same ones."""
    values: dict[str, str] = {}
    if not ENV_FILE.is_file():
        return values
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            if key.strip() in CARRY:
                values[key.strip()] = value.strip().strip('"')
    return values


def service_account(project: str) -> str:
    """The identity Cloud Run gives the service unless told otherwise."""
    code, out, _ = run(
        "projects", "describe", project, "--format=value(projectNumber)", timeout=60,
    )
    if code or not out:
        return ""
    return f"{out}-compute@developer.gserviceaccount.com"


def grant(project: str, account: str) -> None:
    print(f"Granting the service account what it needs\n  {account}\n", flush=True)
    for role, why in ROLES:
        code, _, error = run(
            "projects", "add-iam-policy-binding", project,
            f"--member=serviceAccount:{account}", f"--role={role}",
            "--condition=None", "--format=none", timeout=180,
        )
        mark = "ok" if code == 0 else "could not"
        print(f"  [{mark}] {role} — {why}", flush=True)
        if code and error:
            print(f"         {error.splitlines()[0][:160]}", flush=True)
    print(flush=True)


def deploy(region: str, values: dict[str, str]) -> tuple[int, str]:
    args = [
        "run", "deploy", SERVICE,
        "--source", str(APP_DIR),
        f"--region={region}",
        "--allow-unauthenticated",
        "--quiet",
    ]
    if values:
        args.append("--set-env-vars=" + ",".join(f"{k}={v}" for k, v in values.items()))

    print(f"Deploying {SERVICE} to {region}", flush=True)
    print("  packaging app/ into a container, storing it, starting the service", flush=True)
    print("  the first deployment takes a few minutes\n", flush=True)

    code, out, error = run(*args)
    # gcloud writes its progress to stderr, so both streams are worth showing.
    for stream in (error, out):
        if stream:
            print(stream, flush=True)
    return code, f"{out}\n{error}"


def url(region: str) -> str:
    code, out, _ = run(
        "run", "services", "describe", SERVICE,
        f"--region={region}", "--format=value(status.url)", timeout=120,
    )
    return out if code == 0 else ""


def main() -> int:
    project = project_id()
    region = setting("run/region") or setting("compute/region") or "us-central1"

    if not project:
        print("no project is set — go back to step 2")
        return 1

    account = service_account(project)
    if account:
        grant(project, account)
    else:
        print("could not work out the service account; deploying anyway\n", flush=True)

    values = env_values()
    if values:
        print("Settings the service will start with")
        for key, value in values.items():
            print(f"  {key}={value}")
        print(flush=True)

    code, output = deploy(region, values)
    if code:
        print("\nThe deployment did not finish. The log above says why.")
        return 1

    live = url(region) or (re.search(r"https://\S+\.run\.app", output) or [""])[0]
    print(f"\nService URL: {live}" if live else "\ndeployed, but no URL came back")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
