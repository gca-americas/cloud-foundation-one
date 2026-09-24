import { useEffect, useState } from "react";

import { api, type BillingStatus, type Task } from "../lib/api";

/* Linking a billing account to the project.

   The account is chosen the way a workshop would choose it: the credit you
   were given if you have one, otherwise whichever open account you already
   have. Some accounts can use a billing account without being allowed to list
   them, so "no accounts found" is not the same as "no billing" -- the panel
   reports what it can see rather than guessing. */

export function BillingTask({ task, color }: { task: Task; color: string }) {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");

  useEffect(() => {
    api.billingStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  async function link() {
    setBusy(true);
    setSaid("");
    try {
      const next = await api.billingLink();
      setStatus(next);
      setSaid(next.detail ?? "");
    } catch {
      setSaid("the workbench could not reach gcloud");
    } finally {
      setBusy(false);
    }
  }

  const enabled = status?.enabled ?? false;
  const candidate = status?.candidate;

  return (
    <>
      {task.explain && (
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          {task.explain}
        </p>
      )}

      <div
        className="mt-3 rounded-2xl border p-4"
        style={{ borderColor: "var(--hairline)", background: "var(--overlay)" }}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className="inline-block h-[7px] w-[7px] rounded-full"
            style={{ background: enabled ? "var(--ok)" : "var(--fg-faint)" }}
          />
          <span className="font-mono text-[0.78rem]">
            {status?.project || "no project yet"}
          </span>
          <span className="text-[0.72rem]" style={{ color: "var(--fg-faint)" }}>
            {enabled
              ? `billing on · ${status?.accountName}`
              : "no billing account linked"}
          </span>

          <button
            type="button"
            onClick={link}
            disabled={busy || enabled || !status?.project}
            className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: color }}
          >
            {busy ? "Linking…" : enabled ? "Already linked" : "Do it for me"}
          </button>
        </div>

        {!enabled && candidate && (
          <p className="mt-3 text-sm" style={{ color: "var(--fg-muted)" }}>
            It will use <strong>{candidate.display}</strong> — {candidate.why}.
          </p>
        )}

        {said && (
          <p
            className="mt-3 text-sm"
            style={{ color: enabled ? "var(--fg-muted)" : "var(--bad)" }}
          >
            {said}
          </p>
        )}

        {enabled && (
          <p className="mt-3 text-sm" style={{ color: "var(--fg-muted)" }}>
            The Cloud Billing account remains independent of the project boundary. If you unlink the billing account, the project retains its configuration, while billable services are suspended until billing is re-enabled.
          </p>
        )}
      </div>
    </>
  );
}
