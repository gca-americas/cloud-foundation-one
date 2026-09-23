import { useCallback, useEffect, useRef, useState } from "react";

import { api, type AppStatus } from "../lib/api";

/* The student's app, embedded.

   The app is a separate process -- the workbench starts it, stops it, and
   proxies it at /app so the frame is same-origin. Nothing about it is
   simulated: the iframe is the real app answering real requests, and the
   buttons here do what `python3 app/main.py` and Ctrl+C would do. */

function Dot({ on }: { on: boolean }) {
  return (
    <span
      className="inline-block h-[7px] w-[7px] rounded-full"
      style={{ background: on ? "var(--ok)" : "var(--fg-faint)" }}
    />
  );
}

export function AppPanel({ title, explain, color }: {
  title?: string;
  explain?: string;
  color: string;
}) {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [busy, setBusy] = useState<"" | "start" | "stop">("");
  const [nonce, setNonce] = useState(0);
  const [log, setLog] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [liveLog, setLiveLog] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await api.appStatus());
    } catch {
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 4000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!showLog) return;
    let alive = true;
    const read = async () => {
      try {
        const { log: text } = await api.appLog();
        if (alive) setLiveLog(text.trimEnd());
      } catch {
        /* the panel is still useful without it */
      }
    };
    read();
    const timer = setInterval(read, 3000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [showLog]);

  async function start() {
    setBusy("start");
    setLog("");
    try {
      const next = await api.appStart();
      setStatus(next);
      setNonce((value) => value + 1);
      // A process that starts and immediately dies leaves nothing on the port.
      // The log is the only thing that explains why, so show it rather than
      // quietly reverting to a Start button.
      if (!next.running) {
        const { log: text } = await api.appLog();
        setLog(text.trim().split("\n").slice(-12).join("\n"));
      }
    } finally {
      setBusy("");
    }
  }

  async function stop() {
    setBusy("stop");
    setLog("");
    try {
      setStatus(await api.appStop());
    } finally {
      setBusy("");
    }
  }

  const running = status?.running ?? false;
  // `running` means "answering on the port". A process can be alive and not
  // answering -- still starting, or wedged -- and that is exactly when you
  // need Stop. So the buttons follow "is there a process", not "is it well".
  const managed = status?.managed ?? false;
  const stoppable = running || managed;

  return (
    <div className="mt-4">
      {explain && (
        <p className="mb-3 text-sm" style={{ color: "var(--fg-muted)" }}>
          {explain}
        </p>
      )}

      <div
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: "var(--hairline)", background: "var(--card)" }}
      >
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2.5"
          style={{ borderColor: "var(--hairline)" }}
        >
          <Dot on={running} />
          <span className="text-sm font-medium">{title || "Your app"}</span>
          <span className="font-mono text-[0.7rem]" style={{ color: "var(--fg-faint)" }}>
            {running
              ? `port ${status?.port}`
              : managed
                ? `a process is alive but not answering on ${status?.port}`
                : "not running"}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {stoppable ? (
              <>
                {running && (
                  <>
                    <button
                      type="button"
                      onClick={() => setNonce((value) => value + 1)}
                      className="rounded-lg border px-2.5 py-1 text-xs"
                      style={{ borderColor: "var(--hairline)", color: "var(--fg-muted)" }}
                    >
                      Reload
                    </button>
                    <a
                      href="/app/"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border px-2.5 py-1 text-xs"
                      style={{ borderColor: "var(--hairline)", color: "var(--fg-muted)" }}
                    >
                      Open ↗
                    </a>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowLog((value) => !value)}
                  className="rounded-lg border px-2.5 py-1 text-xs"
                  style={{ borderColor: "var(--hairline)", color: "var(--fg-muted)" }}
                >
                  {showLog ? "Hide log" : "Show log"}
                </button>
                <button
                  type="button"
                  onClick={stop}
                  disabled={busy !== ""}
                  className="rounded-lg border px-2.5 py-1 text-xs disabled:opacity-50"
                  style={{ borderColor: "var(--hairline)", color: "var(--fg-muted)" }}
                >
                  {busy === "stop" ? "Stopping…" : "Stop"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={start}
                disabled={busy !== ""}
                className="rounded-lg px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
                style={{ background: color }}
              >
                {busy === "start" ? "Starting…" : "Start the app"}
              </button>
            )}
          </div>
        </div>

        {running ? (
          <iframe
            key={nonce}
            ref={frame}
            src="/app/"
            title="Your app"
            allow="autoplay"
            className="block w-full"
            style={{ height: 520, border: 0, background: "var(--overlay)" }}
          />
        ) : null}

        {running && showLog && (
          <div className="border-t px-5 py-4" style={{ borderColor: "var(--hairline)" }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[0.7rem]" style={{ color: "var(--fg-faint)" }}>
                What the app has printed
              </span>
              <span className="text-[0.68rem]" style={{ color: "var(--fg-faint)" }}>
                updating
              </span>
            </div>
            <div
              className="quiet-scroll max-h-60 overflow-auto rounded-xl border px-4 py-3 font-mono text-[0.74rem] leading-relaxed whitespace-pre-wrap"
              style={{ background: "var(--code-bg)", color: "var(--code-fg)",
                       borderColor: "var(--hairline)" }}
            >
              {liveLog || "nothing yet"}
            </div>
          </div>
        )}

        {!running && (log ? (
          <div className="px-5 py-5">
            <p className="mb-2 text-sm" style={{ color: "var(--bad)" }}>
              It started and stopped again. This is what it printed:
            </p>
            <div
              className="quiet-scroll max-h-60 overflow-auto rounded-xl border px-4 py-3 font-mono text-[0.74rem] leading-relaxed whitespace-pre-wrap"
              style={{ background: "var(--code-bg)", color: "var(--code-fg)",
                       borderColor: "var(--hairline)" }}
            >
              {log}
            </div>
            <p className="mt-3 text-xs" style={{ color: "var(--fg-faint)" }}>
              A missing module usually means a step that installs one did not
              finish. The last line is the one that matters.
            </p>
          </div>
        ) : (
          <div
            className="grid place-content-center gap-2 px-6 py-16 text-center"
            style={{ color: "var(--fg-faint)" }}
          >
            <p className="text-sm">The app is not running.</p>
            <p className="text-xs">
              It is a separate process. Starting it here is the same as running{" "}
              <code
                className="rounded px-1 py-0.5 font-mono"
                style={{ background: "var(--overlay)" }}
              >
                python3 app/main.py
              </code>{" "}
              in a terminal.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
