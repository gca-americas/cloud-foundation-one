"""Draw the default dino sprite.

The dino is a PNG file the game loads at runtime rather than shapes drawn on
the canvas. That matters for the last step of the course: when a model
generates a new dino, it is swapping this file, not rewriting the game.

Run this to regenerate app/static/dino.png. Uses only the standard library,
because the app has no dependencies until the course adds them.
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

STATIC = Path(__file__).resolve().parent.parent / "app" / "static"
OUT = STATIC / "dino.png"

# The same image again, under a name nothing ever writes over. Step 6 lets a
# model replace dino.png, and "put it back" has to mean something exact --
# snapshotting whatever dino.png happened to be at the time does not.
REFERENCE = STATIC / "dino.default.png"

GRID = 24          # the sprite is drawn on a 24x24 grid of pixels
SCALE = 4          # then scaled up, so it stays crisp and pixel-art looking

BODY = (67, 160, 71, 255)      # green
DARK = (46, 110, 50, 255)      # shading along the underside
EYE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)


def blank() -> list[list[tuple[int, int, int, int]]]:
    return [[CLEAR for _ in range(GRID)] for _ in range(GRID)]


def fill(pixels, x0: int, y0: int, x1: int, y1: int, color) -> None:
    """Inclusive rectangle, clipped to the grid."""
    for y in range(max(0, y0), min(GRID - 1, y1) + 1):
        for x in range(max(0, x0), min(GRID - 1, x1) + 1):
            pixels[y][x] = color


def draw() -> list[list[tuple[int, int, int, int]]]:
    pixels = blank()

    # tail: a narrow band sloping up and back from the body
    for step in range(7):
        fill(pixels, step, 7 + step, step + 2, 10 + step, BODY)

    fill(pixels, 5, 10, 15, 17, BODY)        # body
    fill(pixels, 12, 5, 16, 12, BODY)        # neck
    fill(pixels, 14, 2, 21, 8, BODY)         # head
    fill(pixels, 20, 5, 22, 7, BODY)         # snout
    fill(pixels, 14, 9, 18, 10, BODY)        # jaw

    fill(pixels, 13, 12, 15, 14, BODY)       # arm
    fill(pixels, 6, 18, 9, 22, BODY)         # back leg
    fill(pixels, 11, 18, 14, 21, BODY)       # front leg

    fill(pixels, 5, 16, 15, 17, DARK)        # belly shading
    fill(pixels, 6, 22, 9, 22, DARK)         # feet
    fill(pixels, 11, 21, 14, 21, DARK)

    pixels[4][18] = EYE
    pixels[4][19] = EYE

    return pixels


def encode(pixels) -> bytes:
    """A minimal PNG: signature, IHDR, IDAT, IEND."""
    width = height = GRID * SCALE

    rows = bytearray()
    for y in range(height):
        rows.append(0)  # filter type 0 for every row
        source = pixels[y // SCALE]
        for x in range(width):
            rows.extend(bytes(source[x // SCALE]))

    def chunk(kind: bytes, payload: bytes) -> bytes:
        body = kind + payload
        return (struct.pack(">I", len(payload)) + body
                + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF))

    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)  # 8-bit RGBA
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", header)
            + chunk(b"IDAT", zlib.compress(bytes(rows), 9))
            + chunk(b"IEND", b""))


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    art = encode(draw())
    OUT.write_bytes(art)
    REFERENCE.write_bytes(art)
    print(f"wrote {OUT} and {REFERENCE.name} "
          f"({len(art)} bytes, {GRID * SCALE}x{GRID * SCALE})")


if __name__ == "__main__":
    main()
