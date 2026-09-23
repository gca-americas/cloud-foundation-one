"""Put app/ back to the state the course starts from.

Every step that changes the app changes one marked section of one file, so
resetting is a matter of putting those sections back. Run it whenever a step
went sideways, or to walk through a step a second time.

Nothing about your Google Cloud project is touched: the database stays, the
deployment stays. This only rewinds the code.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STEPS = [
    # (what it undoes, the script that undoes it) -- newest first, so the app
    # is rewound in the order it was built up
    ("the generated dino", ["python3", "scripts/connect_gemini.py", "--undo"]),
    ("the model settings", ["python3", "scripts/setup_gemini_env.py", "--undo"]),
    ("the Firestore leaderboard", ["python3", "scripts/connect_firestore.py", "--undo"]),
]


def main() -> int:
    print("Rewinding app/ to its starting state\n")
    failed = False

    for what, argv in STEPS:
        done = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
        first = (done.stdout or done.stderr).strip().splitlines()
        print(f"· {what}")
        for line in first[:2]:
            print(f"    {line}")
        if done.returncode:
            failed = True

    print("\nThe app is back to a leaderboard in memory and the dino it shipped with.")
    print("Restart it to pick that up.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
