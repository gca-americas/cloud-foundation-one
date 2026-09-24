import { api } from "./api";

/* A second way to notice that a run has finished.

   The event stream is the fast path, and normally the only one needed. But a
   single missed `run.done` leaves a panel animating forever over a command
   that finished a minute ago, and there are ordinary ways to miss it: a
   buffering proxy in Cloud Shell, a sleeping tab, a reconnect mid-run.

   The server records the outcome whether or not anyone was listening, so this
   asks. Whichever notices first wins; the caller is expected to ignore the
   second. */

export function watchRun(
  token: string,
  onDone: (code: number, log: string) => void,
  everyMs = 3000,
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
