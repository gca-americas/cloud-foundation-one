import { api } from "./api";

/* A second way to follow a run.

   The event stream is the fast path, and normally the only one needed. But a
   buffering proxy, a sleeping tab or a reconnect mid-run can cost a panel
   either the output or the `run.done` that ends it -- and a panel with neither
   sits on "waiting for output" over a command that is working, or has already
   finished.

   The server writes every line to a log file and records the outcome whether
   or not anyone is listening. So this asks, repeatedly, for both: the log as
   it grows, and the exit code when it arrives. Whichever source notices first
   wins; the caller is expected to ignore the second. */

export function watchRun(
  token: string,
  onDone: (code: number, log: string) => void,
  onProgress?: (log: string) => void,
  everyMs = 2000,
): () => void {
  let stopped = false;
  let timer: number | undefined;

  const check = async () => {
    if (stopped) return;
    try {
      const status = await api.runStatus(token);
      if (stopped) return;

      if (status.state === "done" && status.code !== null) {
        stopped = true;
        onDone(status.code, status.log);
        return;
      }

      // Still running. Show what it has printed so far, rather than nothing.
      if (onProgress && status.log) onProgress(status.log);
    } catch {
      // A run that is not registered yet, or a blip. Ask again.
    }
    timer = window.setTimeout(check, everyMs);
  };

  timer = window.setTimeout(check, everyMs);

  return () => {
    stopped = true;
    if (timer !== undefined) window.clearTimeout(timer);
  };
}
