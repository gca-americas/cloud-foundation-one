import { useCallback, useEffect, useRef, useState } from "react";

import { api, onRunEvent, type Task } from "../lib/api";
import { watchRun } from "../lib/watchRun";
import { HelpMe } from "./HelpMe";
import { StagePipeline, stageFromLog } from "./StagePipeline";
import { Ticks } from "./Ticks";

/* Asking for the app to be deployed, and watching it happen.

   A first deployment takes minutes and prints hundreds of lines of build
   output. None of it teaches anything, and a beginner reading it learns only
   that the cloud is frightening -- so the panel shows the four things that are
   actually happening and keeps the log one click away for when it fails.

   When it works, the address is the reward. The share buttons open a composer
   with the message and the link already in it; nothing is posted from here. */

export function DeployTask({ slug, task, color }: {
  slug: string;
  task: Task;
  color: string;
}) {
  const [utterance, setUtterance] = useState("");
  const [verdict, setVerdict] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done" | "failed">("idle");
  const [showLog, setShowLog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const token = useRef<string | null>(null);
  const settled = useRef(false);

  const finish = useCallback((code: number, log?: string) => {
    if (settled.current) return;
    settled.current = true;
    setState(code === 0 ? "done" : "failed");
    if (log !== undefined) setLines(log.split("\n").filter(Boolean));
    if (code === 0) api.serviceUrl().then((r) => setUrl(r.url)).catch(() => {});
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

  // A deployment runs for minutes, which is plenty of time to lose the stream.
  useEffect(() => {
    if (state !== "running" || !token.current) return;
    return watchRun(token.current, finish, (log) =>
      setLines(log.split("\n").filter(Boolean)));
  }, [state, finish]);

  async function send() {
    if (!utterance.trim() || busy || state === "running") return;
    setBusy(true);
    setVerdict(null);
    try {
      const response = await api.submitIntent(slug, task.id, utterance);
      if (response.ok && response.token) {
        token.current = response.token;
        settled.current = false;
        setLines([]);
        setState("running");
      } else {
        setVerdict(response.feedback);
      }
    } catch {
      setVerdict("the workbench did not answer");
    } finally {
      setBusy(false);
    }
  }

  const stages = task.stages?.length
    ? task.stages
    : [{ title: "Building", note: "" }, { title: "Running", note: "" }];
  const stage = state === "done" ? stages.length
    : state === "idle" ? 0 : stageFromLog(stages, lines);
  const message = `I just finished Cloud Foundation - One and my app is live on Google Cloud`;
  const share = {
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${message}: ${url}`)}`,
    x: `https://x.com/intent/post?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
  };

  return (
    <>
      {task.prompt && (
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          <Ticks>{task.prompt}</Ticks>
        </p>
      )}

      {state === "idle" && (
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
            style={{ background: "var(--overlay)", borderColor: "var(--hairline-strong)",
                     color: "var(--fg)" }}
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
              The first deployment takes a few minutes.
            </span>
          </div>
        </div>
      )}

      {verdict && (
        <div className="mt-3 rounded-2xl border px-4 py-3 text-sm"
             style={{ background: "var(--overlay)", borderColor: "var(--hairline)",
                      color: "var(--fg-muted)" }}>
          <span className="mr-2 font-semibold" style={{ color: "var(--bad)" }}>
            Not yet.
          </span>
          <Ticks>{verdict}</Ticks>
        </div>
      )}

      {state !== "idle" && (
        <div className="mt-4 rounded-2xl border p-5"
             style={{ background: "var(--overlay)", borderColor: "var(--hairline)" }}>
          <StagePipeline
            stages={stages}
            current={stage}
            failed={state === "failed"}
            label={state === "failed" ? "The deployment stopped" : "Code becoming a running service"}
          />

          <p className="mt-3 text-center text-xs" style={{ color: "var(--fg-muted)" }}>
            {state === "running" && "building and starting your service…"}
            {state === "failed" && "the deployment stopped — the log says why"}
            {state === "done" && !url && "deployed"}
            {state === "done" && url && "your app is live"}
          </p>

          {state === "done" && url && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border px-3.5 py-1.5 font-mono text-[0.78rem]"
                style={{ borderColor: "var(--ok)", color: "var(--ok)" }}
              >
                {url} ↗
              </a>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs" style={{ color: "var(--fg-faint)" }}>
                  Tell someone:
                </span>
                <a
                  href={share.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
                >
                  Share on LinkedIn
                </a>
                <a
                  href={share.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
                >
                  Share on X
                </a>
              </div>
              <span className="text-[0.68rem]" style={{ color: "var(--fg-faint)" }}>
                Opens a post with the message ready. You decide whether to send it.
              </span>
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowLog((value) => !value)}
              className="rounded-full border px-3 py-1 text-xs"
              style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
            >
              {showLog ? "Hide log" : "Show log"}
            </button>
          </div>

          {showLog && (
            <div
              className="quiet-scroll mt-3 max-h-64 overflow-y-auto rounded-xl border px-4 py-3 font-mono text-[0.74rem] leading-relaxed whitespace-pre-wrap"
              style={{ background: "var(--code-bg)", color: "var(--code-fg)",
                       borderColor: "var(--hairline)" }}
            >
              {lines.length ? lines.join("\n") : "waiting for output…"}
            </div>
          )}
        </div>
      )}
    </>
  );
}
