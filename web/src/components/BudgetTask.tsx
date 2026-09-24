import { useEffect, useState } from "react";

import { api, type BudgetStatus, type ServicesStatus } from "../lib/api";

/* The budget alert, made for you.

   Not a task of its own: the step asks you to make it in the console, because
   seeing the billing pages is worth something. This sits beside that link for
   anyone who would rather not, the same way the terminal's Help me sits beside
   the prompt. */

export function BudgetAssist({ label = "Create it for me" }: { label?: string }) {
  const [status, setStatus] = useState<BudgetStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.budgetStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  async function create() {
    setBusy(true);
    setSaid("");
    setFailed(false);
    try {
      const next = await api.budgetCreate();
      setStatus(next);
      setSaid(next.detail ?? "");
      setFailed(next.ok === false);
    } catch {
      setSaid("the workbench could not reach gcloud");
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const has = (status?.count ?? 0) > 0;

  return (
    <>
      <button
        type="button"
        onClick={create}
        disabled={busy || !status?.account}
        title={
          status?.account
            ? "Creates a $10 budget on this project, alerting at 50%, 90% and 100%"
            : "Link a billing account first"
        }
        className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
      >
        {busy ? "Creating…" : has ? "Make another for me" : label}
      </button>

      {said && (
        <p
          className="mt-2 w-full text-sm"
          style={{ color: failed ? "var(--bad)" : "var(--fg-muted)" }}
        >
          {said}
          {failed && (
            <>
              {" "}
              If automated creation fails due to billing account permissions, configure the budget directly in the Google Cloud console.
            </>
          )}
        </p>
      )}
    </>
  );
}


/** The same idea for the seven APIs the course needs. */
export function ServicesAssist({ label = "Enable them for me" }: { label?: string }) {
  const [status, setStatus] = useState<ServicesStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");

  useEffect(() => {
    api.servicesStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  async function enable() {
    setBusy(true);
    setSaid("");
    try {
      const next = await api.servicesEnable();
      setStatus(next);
      setSaid(next.detail ?? "");
    } catch {
      setSaid("the workbench could not reach gcloud");
    } finally {
      setBusy(false);
    }
  }

  const missing = status?.missing.length ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={enable}
        disabled={busy || missing === 0}
        title={
          missing === 0
            ? "They are all on already"
            : `Enables the ${missing} still switched off`
        }
        className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
      >
        {busy ? "Enabling…" : missing === 0 ? "All on" : label}
      </button>

      {said && (
        <p className="mt-2 w-full text-sm" style={{ color: "var(--fg-muted)" }}>
          {said}
        </p>
      )}
    </>
  );
}
