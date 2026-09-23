"""Tell the app which project and which endpoint to call. Step 6.

Writes app/.env and installs the Google Gen AI SDK into app/.venv. No code
changes here — this is only the settings the SDK reads at startup:

  GOOGLE_GENAI_USE_VERTEXAI  call the Gemini API on Gemini Enterprise Agent
                             Platform, with the project's own credentials,
                             rather than the Gemini Developer API and a key
  GOOGLE_CLOUD_PROJECT       who gets billed, and whose quota is used
  GOOGLE_CLOUD_LOCATION      which endpoint answers

Run with --undo to remove the file.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_DIR = ROOT / "app"
ENV_FILE = APP_DIR / ".env"
REQUIREMENTS = APP_DIR / "requirements.txt"
VENV_PYTHON = APP_DIR / ".venv" / "bin" / "python"

SDK = "google-genai"
MODEL = "gemini-3.5-flash"

# The global endpoint. A production service names a region here, for the same
# reasons step 3 gave: it says where the request is served, and it is the only
# way to make a promise about where data is handled. `global` gives up that
# control in exchange for capacity — the request goes wherever there is room.
# For a classroom, capacity is the thing that keeps failing, so this course
# uses it and says so.
LOCATION = "global"


def project() -> str:
    saved = Path.home() / "project_id.txt"
    if saved.is_file() and saved.read_text().strip():
        return saved.read_text().strip()

    done = subprocess.run(
        ["gcloud", "config", "get-value", "project"],
        capture_output=True, text=True,
    )
    return done.stdout.strip()


def write(project_id: str) -> None:
    ENV_FILE.write_text(
        "# Settings the app reads at startup. Written by step 6.\n"
        "# Not committed: the project id is specific to you.\n"
        "\n"
        "GOOGLE_GENAI_USE_VERTEXAI=True\n"
        f"GOOGLE_CLOUD_PROJECT={project_id}\n"
        f"GOOGLE_CLOUD_LOCATION={LOCATION}\n"
        f"DINO_MODEL={MODEL}\n"
    )
    print(f"wrote app/.env\n")
    print(f"  GOOGLE_GENAI_USE_VERTEXAI  True")
    print(f"  GOOGLE_CLOUD_PROJECT       {project_id}")
    print(f"  GOOGLE_CLOUD_LOCATION      {LOCATION}")
    print(f"  DINO_MODEL                 {MODEL}")


def requirements() -> None:
    lines = [
        line for line in REQUIREMENTS.read_text().splitlines()
        if line.strip() and not line.startswith(SDK) and not line.startswith("#")
    ]
    lines.append(SDK)
    REQUIREMENTS.write_text("\n".join(lines) + "\n")


def installed() -> bool:
    if not VENV_PYTHON.exists():
        return False
    done = subprocess.run(
        [str(VENV_PYTHON), "-c", "import google.genai"], capture_output=True, text=True,
    )
    return done.returncode == 0


def install() -> None:
    if installed():
        print(f"\n{SDK} is already installed")
        return

    if not VENV_PYTHON.exists():
        print("\ncreating app/.venv", flush=True)
        made = subprocess.run(
            [sys.executable, "-m", "venv", str(APP_DIR / ".venv")],
            capture_output=True, text=True,
        )
        if made.returncode:
            print(made.stderr.strip().splitlines()[-1][:200] if made.stderr else "venv failed")
            return

    print(f"\ninstalling {SDK} into app/.venv (this takes a minute)", flush=True)
    done = subprocess.run(
        [str(VENV_PYTHON), "-m", "pip", "install", "--quiet", SDK],
        capture_output=True, text=True,
    )
    if done.returncode:
        print(done.stderr.strip().splitlines()[-1][:220] if done.stderr else "pip failed")
        return
    print("installed")


def main() -> int:
    if "--undo" in sys.argv:
        ENV_FILE.unlink(missing_ok=True)
        print("removed app/.env")
        return 0

    project_id = project()
    if not project_id:
        print("no project is set — go back to step 2")
        return 1

    write(project_id)
    requirements()
    install()
    print("\nThe app reads this file when it starts. Nothing is running yet.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
