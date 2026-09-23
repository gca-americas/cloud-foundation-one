"""How far away is each region, from where you are sitting? Step 2.

Opens a TCP connection to a Google Cloud endpoint in each region and times it.
No authentication, no project, nothing created, nothing charged -- we only care
how long the handshake takes, and the network answers that before anyone asks
who we are.

The numbers belong to you. Someone running this on the other side of the world
gets a different table, and that is the entire lesson.
"""

from __future__ import annotations

import socket
import time

# Spread deliberately wide, so the shape of the planet shows up in the numbers.
REGIONS = [
    ("us-central1", "Iowa, USA"),
    ("us-east4", "Virginia, USA"),
    ("europe-west1", "Belgium"),
    ("asia-southeast1", "Singapore"),
    ("southamerica-east1", "São Paulo, Brazil"),
    ("australia-southeast1", "Sydney, Australia"),
]

ATTEMPTS = 3
TIMEOUT = 5.0


def probe(host: str) -> float | None:
    """Best of three TCP handshakes, in milliseconds. Best, not average: we
    want the physics, not whatever else your wifi was doing at the time."""
    best: float | None = None
    for _ in range(ATTEMPTS):
        started = time.perf_counter()
        try:
            with socket.create_connection((host, 443), timeout=TIMEOUT):
                pass
        except OSError:
            continue
        elapsed = (time.perf_counter() - started) * 1000
        best = elapsed if best is None else min(best, elapsed)
    return best


def bar(ms: float, worst: float) -> str:
    width = max(1, round((ms / worst) * 34)) if worst else 1
    return "#" * width


def main() -> None:
    print("measuring the round trip to six regions, from right here\n", flush=True)

    results: list[tuple[str, str, float | None]] = []
    for region, where in REGIONS:
        host = f"{region}-run.googleapis.com"
        print(f"  ... {region:<22} {where}", flush=True)
        results.append((region, where, probe(host)))

    reachable = [ms for _, _, ms in results if ms is not None]
    worst = max(reachable) if reachable else 1.0

    print("\n  region                 where                  round trip")
    print("  " + "-" * 62, flush=True)
    for region, where, ms in results:
        if ms is None:
            print(f"  {region:<22} {where:<22} unreachable")
            continue
        print(f"  {region:<22} {where:<22} {ms:6.0f} ms  {bar(ms, worst)}")

    if reachable:
        nearest = min((r for r in results if r[2] is not None), key=lambda r: r[2])
        furthest = max((r for r in results if r[2] is not None), key=lambda r: r[2])
        gap = furthest[2] - nearest[2]
        print(f"\n  nearest:  {nearest[0]} at {nearest[2]:.0f} ms")
        print(f"  furthest: {furthest[0]} at {furthest[2]:.0f} ms")
        print(f"\n  choosing badly costs you {gap:.0f} ms on every single request.")
        print("  that is before your code does any work at all.", flush=True)


if __name__ == "__main__":
    main()
