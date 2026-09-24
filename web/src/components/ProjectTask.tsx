import { useEffect, useState } from "react";

import { api, type ProjectStatus, type Task } from "../lib/api";

/* Creating the project the rest of the course uses.

   Two ways through, and both end in the same place. Make it yourself in the
   console, then press Done and the workbench looks for it. Or press "Do it for
   me" and it runs the create for you. Either way the id it finds is written to
   ~/project_id.txt, which every later step reads.

   Nothing is taken on trust: Done does not mark anything complete, it goes and
   looks. */

export function ProjectTask({ task, color }: { task: Task; color: string }) {
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [busy, setBusy] = useState<"" | "create" | "confirm">("");
  const [said, setSaid] = useState("");

  useEffect(() => {
    api.projectStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  async function create() {
    setBusy("create");
    setSaid("");
    try {
      const next = await api.projectCreate();
      setStatus(next);
      setSaid(next.ok === false ? next.detail || "could not create it" : "");
    } catch {
      setSaid("the workbench could not reach gcloud");
    } finally {
      setBusy("");
    }
  }

  async function confirm() {
    setBusy("confirm");
    setSaid("");
    try {
      const next = await api.projectConfirm();
      setStatus(next);
      if (next.ok === false) setSaid(next.detail || "not found yet");
    } catch {
      setSaid("the workbench could not reach gcloud");
    } finally {
      setBusy("");
    }
  }

  const ready = Boolean(status?.project);

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
        {!ready && status && (
          <p className="mb-3 text-sm" style={{ color: "var(--fg-muted)" }}>
            Name it{" "}
            <code
              className="rounded px-1.5 py-0.5 font-mono"
              style={{ background: "var(--card)", color: "var(--fg)" }}
            >
              {status.name}
            </code>
            .
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className="inline-block h-[7px] w-[7px] rounded-full"
            style={{ background: ready ? "var(--ok)" : "var(--fg-faint)" }}
          />
          <span className="font-mono text-[0.78rem]">
            {ready ? status?.project : status?.name ?? "my-dinoquest"}
          </span>
          <span className="text-[0.72rem]" style={{ color: "var(--fg-faint)" }}>
            {ready ? "exists · recorded in ~/project_id.txt" : "not created yet"}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={confirm}
              disabled={busy !== ""}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
              style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
            >
              {busy === "confirm" ? "Looking…" : "I made it"}
            </button>
            <button
              type="button"
              onClick={create}
              disabled={busy !== "" || ready}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: color }}
            >
              {busy === "create" ? "Creating…" : "Do it for me"}
            </button>
          </div>
        </div>

        {said && (
          <p className="mt-3 text-sm" style={{ color: "var(--bad)" }}>
            {said}
          </p>
        )}

        {ready && (
          <p className="mt-3 text-sm" style={{ color: "var(--fg-muted)" }}>
            Your globally unique project ID is <code className="font-mono">{status?.project}</code> (with display name{" "}
            <code className="font-mono">{status?.name}</code>). Because project IDs must be unique across all of Google Cloud, a numeric suffix is appended to distinguish the immutable project ID from the human-readable project name.
          </p>
        )}
      </div>
    </>
  );
}
