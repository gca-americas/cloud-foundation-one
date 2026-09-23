"""Does this project's billing account have a budget on it? Step 3's check.

Two questions in a row -- which billing account pays for this project, and what
budgets exist on that account -- which is one more than a single gcloud command
can answer, hence a script.

Prints BUDGETS=<n>. Read-only throughout.
"""

from __future__ import annotations

import json
import subprocess
import sys


def gcloud(*args: str) -> tuple[int, str]:
    try:
        proc = subprocess.run(["gcloud", *args], capture_output=True,
                              text=True, timeout=45)
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return 1, ""
    return proc.returncode, proc.stdout.strip()


def main() -> int:
    code, project = gcloud("config", "get-value", "project")
    if code or not project or project == "(unset)":
        print("BUDGETS=unknown (no project set)")
        return 0

    code, account = gcloud("billing", "projects", "describe", project,
                           "--format=value(billingAccountName)")
    if code or not account:
        print("BUDGETS=unknown (no billing account linked)")
        return 0

    # billingAccounts/0X0X0X-0X0X0X-0X0X0X -> the bare id
    account_id = account.rsplit("/", 1)[-1]

    code, raw = gcloud("billing", "budgets", "list",
                       f"--billing-account={account_id}", "--format=json")
    if code:
        # Almost always the Budget API not being enabled, which is worth saying
        # out loud rather than reporting as "no budgets".
        print("BUDGETS=unknown (could not list budgets -- "
              "billingbudgets.googleapis.com may not be enabled)")
        return 0

    try:
        budgets = json.loads(raw) if raw else []
    except json.JSONDecodeError:
        budgets = []

    print(f"BUDGETS={len(budgets)}")
    for budget in budgets:
        name = budget.get("displayName", "(unnamed)")
        amount = budget.get("amount", {}).get("specifiedAmount", {})
        units = amount.get("units", "?")
        currency = amount.get("currencyCode", "")
        print(f"  {name}: {units} {currency}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
