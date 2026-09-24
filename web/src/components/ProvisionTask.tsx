import { useCallback, useEffect, useRef, useState } from "react";

import { api, onRunEvent, type Task } from "../lib/api";
import { watchRun } from "../lib/watchRun";
import { HelpMe } from "./HelpMe";

/* Asking for something to be built, and watching it happen.

   Same request box as any intent task, but what comes back is not a wall of
   log. Provisioning a database takes a minute or two, and a beginner staring
   at gcloud's output learns nothing from it -- so the log is behind a button
   and the panel shows the thing being made instead.

   The log is one click away, not hidden: when it fails, that output is the
   only thing that helps. */

function Building({ done, failed }: { done: boolean; failed: boolean }) {
  const colour = failed ? "var(--bad)" : done ? "var(--ok)" : "var(--accent)";
  const rows = [0, 1, 2];

  return (
    <svg viewBox="0 0 320 150" role="img"
         aria-label={done ? "A database, created" : "A database being created"}
         style={{ width: "100%", maxWidth: 340, margin: "0 auto", display: "block" }}>
      <defs>
        <linearGradient id="prov-sweep" x1="0" x2="1">
          <stop offset="0%" stopColor={colour} stopOpacity="0" />
          <stop offset="50%" stopColor={colour} stopOpacity="0.45" />
          <stop offset="100%" stopColor={colour} stopOpacity="0" />
          {!done && !failed && (
            <animate attributeName="x1" values="-1;1" dur="1.8s" repeatCount="indefinite" />
          )}
          {!done && !failed && (
            <animate attributeName="x2" values="0;2" dur="1.8s" repeatCount="indefinite" />
          )}
        </linearGradient>
      </defs>

      {/* a database, drawn the way databases have been drawn since 1975 */}
      <ellipse cx="160" cy="44" rx="54" ry="15" fill="none" stroke={colour} strokeWidth="1.6" />
      <path d="M106 44 v52 a54 15 0 0 0 108 0 v-52" fill="none" stroke={colour}
            strokeWidth="1.6" />
      <path d="M106 70 a54 15 0 0 0 108 0" fill="none" stroke={colour} strokeWidth="1"
            opacity="0.5" />

      <rect x="106" y="29" width="108" height="82" fill="url(#prov-sweep)" />

      {rows.map((row) => (
        <rect key={row} x={122} y={84 + row * 0} width={76} height={0} fill="none" />
      ))}

      {done && (
        <path d="M148 70 l8 9 18 -21" fill="none" stroke="var(--ok)" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round" />
      )}

      <text x="160" y="134" textAnchor="middle"
            style={{ fontSize: 11, fill: "var(--fg-muted)", fontFamily: "inherit" }}>
        {failed ? "it did not finish" : done ? "Firestore is ready" : "creating the database…"}
      </text>
    </svg>
  );
}

export function ProvisionTask({ slug, task, color }: {
  slug: string;
  task: Task;
  color: string;
}) {
  const [utterance, setUtterance] = useState("");
  const [verdict, setVerdict] = useState<{ ok: boolean; feedback: string } | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done" | "failed">("idle");
  const [showLog, setShowLog] = useState(false);
  const [busy, setBusy] = useState(false);
  const token = useRef<string | null>(null);
  const settled = useRef(false);
  const tail = useRef<HTMLDivElement>(null);

  const finish = useCallback((code: number, log?: string) => {
    if (settled.current) return;
    settled.current = true;
    setState(code === 0 ? "done" : "failed");
    if (log !== undefined) setLines(log.split("\n").filter(Boolean));
  }, []);

  useEffect(
    () =>
      onRunEvent((event) => {
        if (event.token !== token.current) return;
        if (event.type === "run.line") setLines((previous) => [...previous, event.line]);
        if (event.type === "run.done") {
          finish(event.code);
          api
            .runStatus(event.token)
            .then((status) => setLines(status.log.split("\n").filter(Boolean)))
            .catch(() => {});
        }
      }),
    [finish],
  );

  // The stream can be missed; the record cannot.
  useEffect(() => {
    if (state !== "running" || !token.current) return;
    return watchRun(token.current, finish);
  }, [state, finish]);

  useEffect(() => {
    if (showLog) tail.current?.scrollIntoView({ block: "nearest" });
  }, [lines.length, showLog]);

  async function send() {
    if (!utterance.trim() || busy || state === "running") return;
    setBusy(true);
    setVerdict(null);
    try {
      const response = await api.submitIntent(slug, task.id, utterance);
      setVerdict({ ok: response.ok, feedback: response.feedback });
      if (response.ok && response.token) {
        token.current = response.token;
        settled.current = false;
        setLines([]);
        setState("running");
      }
    } catch {
      setVerdict({ ok: false, feedback: "the workbench did not answer" });
    } finally {
      setBusy(false);
    }
  }

  const started = state !== "idle";

  return (
    <>
      {task.prompt && (
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          {task.prompt}
        </p>
      )}

      {task.url && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border px-3 py-1.5 text-sm font-medium"
            style={{ borderColor: color, color }}
          >
            {task.linkLabel ?? "Open in the console"} ↗
          </a>
        </div>
      )}

      {!started && (
        <div className="mt-3">
          <textarea
            value={utterance}
            onChange={(event) => setUtterance(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) send();
            }}
            rows={2}
            placeholder="Describe what you want, the way you'd ask an assistant…"
            className="w-full resize-y rounded-lg border px-3.5 py-2.5 text-sm outline-none"
            style={{
              background: "var(--overlay)",
              borderColor: "var(--hairline-strong)",
              color: "var(--fg)",
            }}
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={send}
              disabled={busy || !utterance.trim()}
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: color }}
            >
              {busy ? "Checking…" : "Send"}
            </button>
            <HelpMe example={task.example} onUse={setUtterance} />
            <span className="text-xs" style={{ color: "var(--fg-faint)" }}>
              If the request is clear enough to act on, it runs.
            </span>
          </div>
        </div>
      )}

      {verdict && !verdict.ok && (
        <div
          className="mt-3 rounded-2xl border px-4 py-3 text-sm"
          style={{ background: "var(--overlay)", borderColor: "var(--hairline)",
                   color: "var(--fg-muted)" }}
        >
          <span className="mr-2 font-semibold" style={{ color: "var(--bad)" }}>
            Not yet.
          </span>
          {verdict.feedback}
        </div>
      )}

      {started && (
        <div
          className="mt-4 rounded-2xl border p-5"
          style={{ background: "var(--overlay)", borderColor: "var(--hairline)" }}
        >
          <Building done={state === "done"} failed={state === "failed"} />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowLog((value) => !value)}
              className="rounded-full border px-3 py-1 text-xs"
              style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
            >
              {showLog ? "Hide log" : "Show log"}
            </button>
            {state === "failed" && (
              <span className="text-xs" style={{ color: "var(--bad)" }}>
                The log says why.
              </span>
            )}
          </div>

          {showLog && (
            <div
              className="quiet-scroll mt-3 max-h-64 overflow-y-auto rounded-xl border px-4 py-3 font-mono text-[0.74rem] leading-relaxed whitespace-pre-wrap"
              style={{ background: "var(--code-bg)", color: "var(--code-fg)",
                       borderColor: "var(--hairline)" }}
            >
              {lines.length ? lines.join("\n") : "waiting for output…"}
              <div ref={tail} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
