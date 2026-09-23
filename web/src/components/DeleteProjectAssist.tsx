import { useEffect, useState } from "react";

import { api } from "../lib/api";

/* Shutting the project down, for anyone who would rather not use the console.

   Every other assist in the course is one click, because everything else can
   be made again. This one cannot, so it asks twice and names the project it is
   about to delete. That is not friction for its own sake: the button sits next
   to a console link on a page about tearing things down, and a student
   clicking through the step should not be able to lose a project by reflex. */

export function DeleteProjectAssist({ label = "Do it for me" }: { label?: string }) {
  const [project, setProject] = useState("");
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.projectStatus().then((s) => setProject(s.project || "")).catch(() => {});
  }, []);

  async function remove() {
    setBusy(true);
    setSaid("");
    setFailed(false);
    try {
      const result = await api.projectDelete(project);
      setSaid(result.detail ?? "");
      setFailed(!result.ok);
      setDone(Boolean(result.ok));
    } catch {
      setSaid("the workbench could not reach gcloud");
      setFailed(true);
    } finally {
      setBusy(false);
      setAsking(false);
    }
  }

  if (done) {
    return (
      <p className="mt-2 w-full text-sm" style={{ color: "var(--fg-muted)" }}>
        {said}
      </p>
    );
  }

  return (
    <>
      {!asking ? (
        <button
          type="button"
          onClick={() => setAsking(true)}
          disabled={!project}
          title={project ? `Deletes ${project}` : "No project recorded yet"}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
          style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
        >
          {label}
        </button>
      ) : (
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Delete <code className="font-mono">{project}</code> and everything in it?
          </span>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--bad)" }}
          >
            {busy ? "Deleting…" : "Yes, delete it"}
          </button>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
          >
            Keep it
          </button>
        </span>
      )}

      {said && (
        <p
          className="mt-2 w-full text-sm"
          style={{ color: failed ? "var(--bad)" : "var(--fg-muted)" }}
        >
          {said}
        </p>
      )}
    </>
  );
}
