"""Let the app ask a model to draw the dino. Step 6.

Replaces one marked section of app/main.py, the same way step 5 replaced the
leaderboard. The game, the routes and the leaderboard are untouched.

Run with --undo to put the placeholder back.
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_DIR = ROOT / "app"
APP = APP_DIR / "main.py"
SPRITE = APP_DIR / "static" / "dino.png"

# The sprite the game ships with, written by scripts/make_sprite.py and never
# written over. Generating replaces dino.png; this is what "put it back" means.
DEFAULT = APP_DIR / "static" / "dino.default.png"

BEGIN = "# ── the dino ───────────────────────────────────────────────── begin dino ──"
END = "# ─────────────────────────────────────────────────────────────── end dino ──"

PLACEHOLDER = '''
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
'''

GEMINI = '''
#
# The dino is now drawn by Gemini. The model does not send back a picture: it
# sends back a grid of letters and a colour for each letter, and the few lines
# at the bottom of this section turn that into the PNG the game already loads.
#
# The settings come from app/.env, which step 6 wrote. Nothing here names a
# project or an endpoint, because those change between machines and this file
# does not.

import logging                                # noqa: E402
import struct                                 # noqa: E402
import time                                   # noqa: E402
import zlib                                   # noqa: E402

from google import genai                      # noqa: E402
from google.genai import types                # noqa: E402

# The SDK warns once about automatic function calling. This code passes the
# model no tools to call, so the warning does not apply — quiet it, so what
# the app prints is only about the app.
logging.getLogger("google_genai.models").setLevel(logging.ERROR)

# Whether the dino maker is offered at all. If step 6's setup task has not run,
# there is nothing to call, and a button that can only fail is worse than no
# button.
DINO_READY = bool(os.environ.get("GOOGLE_CLOUD_PROJECT"))

GRID = 24          # the sprite is a 24x24 grid, like the one it replaces
SCALE = 4
MODEL = os.environ.get("DINO_MODEL", "gemini-3.5-flash")

# Calls to a hosted model fail for reasons that have nothing to do with your
# code: the region is busy, the quota is spent, the request was rate limited.
# Those are worth trying again. Three attempts, a minute apart, and then the
# app gives up and says so rather than retrying forever.
ATTEMPTS = 3
WAIT_SECONDS = 60

INSTRUCTIONS = """You draw pixel art for a side-scrolling runner game.

Draw the character described by the player as a 24 by 24 pixel sprite, facing
right, standing on the bottom row, filling most of the grid.

Return JSON with two fields:
  palette: up to six colours, each a letter and a "#rrggbb" value
  rows:    exactly 24 strings of exactly 24 characters, using those letters,
           with "." for transparent

Use flat blocks of colour and a darker shade along the underside."""

# The shape of the answer, sent with the request. The model is held to it, so
# the code below can read the reply without checking whether the model felt
# like using the format this time.
SHAPE = {
    "type": "object",
    "properties": {
        "palette": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "letter": {"type": "string"},
                    "colour": {"type": "string"},
                },
                "required": ["letter", "colour"],
            },
        },
        "rows": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["palette", "rows"],
}


_client = None


def client():
    """One client, built on first use and kept.

    Built here rather than when this file is imported: a missing setting should
    cost you the dino, not the whole app. The client also holds an open
    connection, so building a new one per request is both slower and a way to
    have the old one closed underneath you.

    vertexai=True sends the request to the Gemini API on Gemini Enterprise
    Agent Platform, signed with this machine's own Google Cloud credentials.
    There is no API key anywhere in this file.
    """
    global _client
    if _client is None:
        _client = genai.Client(
            vertexai=True,
            project=os.environ["GOOGLE_CLOUD_PROJECT"],
            location=os.environ.get("GOOGLE_CLOUD_LOCATION", "global"),
        )
    return _client


def _ask(idea: str) -> dict:
    answer = client().models.generate_content(
        model=MODEL,
        contents=f"The player asked for: {idea or 'a friendly green dinosaur'}",
        config=types.GenerateContentConfig(
            system_instruction=INSTRUCTIONS,
            response_mime_type="application/json",
            response_schema=SHAPE,
            temperature=0.9,
        ),
    )
    return json.loads(answer.text)


def _png(palette: list, rows: list) -> bytes:
    """Turn the grid into the PNG file the game already loads."""

    colours = {str(entry.get("letter", ""))[:1]: str(entry.get("colour", ""))
               for entry in palette}

    def colour(letter: str) -> bytes:
        code = colours.get(letter, "").lstrip("#")
        if len(code) != 6:
            return bytes((0, 0, 0, 0))          # anything unknown is transparent
        return bytes((int(code[0:2], 16), int(code[2:4], 16), int(code[4:6], 16), 255))

    grid = [(row + "." * GRID)[:GRID] for row in rows[:GRID]]
    grid += ["." * GRID] * (GRID - len(grid))

    size = GRID * SCALE
    raw = bytearray()
    for y in range(size):
        raw.append(0)                            # PNG filter byte, one per row
        for x in range(size):
            raw.extend(colour(grid[y // SCALE][x // SCALE]))

    def chunk(kind: bytes, payload: bytes) -> bytes:
        body = kind + payload
        return (struct.pack(">I", len(payload)) + body
                + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF))

    return (b"\\x89PNG\\r\\n\\x1a\\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
            + chunk(b"IEND", b""))


def make_dino(idea: str) -> dict:
    """Ask the model for a sprite and write it over static/dino.png."""
    if not os.environ.get("GOOGLE_CLOUD_PROJECT"):
        return {"ok": False,
                "detail": "app/.env is missing — run the setup task in step 6 first"}

    problem = "the model did not answer"

    for attempt in range(1, ATTEMPTS + 1):
        try:
            drawing = _ask(idea)
            (STATIC / "dino.png").write_bytes(
                _png(drawing.get("palette") or {}, drawing.get("rows") or [])
            )
            print(f"  drew a new dino on attempt {attempt}", flush=True)
            return {"ok": True, "attempts": attempt}
        except Exception as failure:            # noqa: BLE001 - report, do not crash
            problem = f"{type(failure).__name__}: {failure}"[:200]
            print(f"  attempt {attempt} failed — {problem}", flush=True)
            if attempt < ATTEMPTS:
                print(f"  waiting {WAIT_SECONDS}s before trying again", flush=True)
                time.sleep(WAIT_SECONDS)

    return {"ok": False, "detail": problem, "attempts": ATTEMPTS}


def restore_dino() -> dict:
    """Put the dino that shipped with the game back.

    Generating writes over static/dino.png. The sprite the game shipped with
    is kept beside it under a name nothing writes to, so going back is exact.
    Being able to undo is not a courtesy — it is what makes trying something
    cheap enough to be worth doing.
    """
    shipped = STATIC / "dino.default.png"
    if not shipped.is_file():
        return {"ok": False, "detail": "there is no original to go back to"}

    (STATIC / "dino.png").write_bytes(shipped.read_bytes())
    print("  put the original dino back", flush=True)
    return {"ok": True, "restored": True}
'''


def swap(to_gemini: bool) -> bool:
    source = APP.read_text()
    start = source.find(BEGIN)
    end = source.find(END)
    if start == -1 or end == -1:
        print("could not find the dino section in app/main.py")
        return False

    already = "genai.Client(" in source
    if already == to_gemini:
        print("the dino section is already " + ("wired to Gemini" if to_gemini else "back"))
        return True

    wanted = GEMINI if to_gemini else PLACEHOLDER
    APP.write_text(source[:start] + BEGIN + wanted + "\n" + source[end:])
    print("app/main.py now asks Gemini for the dino" if to_gemini
          else "app/main.py no longer calls a model")
    return True


def put_the_dino_back() -> None:
    """Undo leaves the game with the sprite it shipped with."""
    if DEFAULT.is_file():
        shutil.copyfile(DEFAULT, SPRITE)
        print("put the original dino back")


def main() -> int:
    undo = "--undo" in sys.argv

    # Checked before anything is written. Swapping the code first and failing
    # afterwards leaves an app that will not start.
    if not undo and not (APP_DIR / ".env").is_file():
        print("app/.env is missing — run the setup task in step 6 first.")
        print("Nothing has been changed.")
        return 1

    if not swap(to_gemini=not undo):
        return 1
    if undo:
        put_the_dino_back()
    else:
        print("\nRestart the app to pick it up.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
