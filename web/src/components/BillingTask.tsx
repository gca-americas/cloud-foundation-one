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
  const [busy, setBusy] = useState<"" | "link" | "check">("");
  const [said, setSaid] = useState("");

  useEffect(() => {
    api.billingStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  async function link() {
    setBusy("link");
    setSaid("");
    try {
      const next = await api.billingLink();
      setStatus(next);
      setSaid(next.detail ?? "");
    } catch {
      setSaid("the workbench could not reach gcloud");
    } finally {
      setBusy("");
    }
  }

  async function check() {
    setBusy("check");
    setSaid("");
    try {
      const next = await api.billingStatus();
      setStatus(next);
      if (!next.enabled) {
        setSaid("No active billing account is linked to this project yet.");
      }
    } catch {
      setSaid("the workbench could not reach gcloud");
    } finally {
      setBusy("");
    }
  }

  const enabled = status?.enabled ?? false;
  const candidate = status?.candidate;
  const billingUrl = "https://console.cloud.google.com/billing?cloudshell=true";

  return (
    <>
      {task.explain && (
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          {task.explain}
        </p>
      )}

      <img
        src={task.image ?? "/img/billing.png"}
        alt="Billing account management in the Google Cloud console"
        className="mt-3 block w-full rounded-2xl border"
        style={{ borderColor: "var(--hairline)" }}
      />

      <div
        className="mt-3 rounded-2xl border p-4 text-sm"
        style={{ borderColor: "var(--hairline)", background: "var(--overlay)", color: "var(--fg-muted)" }}
      >
        <p className="font-medium" style={{ color: "var(--fg)" }}>
          Choose either method to link your billing account:
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">
          <li>
            <strong>Automatic (recommended):</strong> Click <strong>Do it for me</strong> below to link your active workshop billing account to <code className="font-mono">{status?.project || "your project"}</code> automatically.
          </li>
          <li>
            <strong>In the Google Cloud console:</strong> Click <strong>Open Cloud Billing console ↗</strong> to open the <strong>Billing account management</strong> page. Confirm your active credit appears under <strong>Your billing accounts</strong>, switch to the <strong>Your projects</strong> tab, open the <strong>Actions (⋮)</strong> menu next to <code className="font-mono">{status?.project || "your project"}</code>, select <strong>Change billing</strong>, choose your billing account, and click <strong>Set account</strong>. Then return here and click <strong>I linked it</strong>.
          </li>
        </ol>
      </div>

      <div
        className="mt-3 rounded-2xl border p-4"
        style={{ borderColor: "var(--hairline)", background: "var(--overlay)" }}
      >
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <a
            href={billingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border px-3 py-1.5 text-sm font-medium"
            style={{ borderColor: color, color }}
          >
            Open Cloud Billing console ↗
          </a>
        </div>

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

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={check}
              disabled={busy !== "" || !status?.project}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
              style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
            >
              {busy === "check" ? "Checking…" : "I linked it"}
            </button>
            <button
              type="button"
              onClick={link}
              disabled={busy !== "" || enabled || !status?.project}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: color }}
            >
              {busy === "link" ? "Linking…" : enabled ? "Already linked" : "Do it for me"}
            </button>
          </div>
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
