import { useCallback, useEffect, useRef, useState } from "react";

import { api, onRunEvent, type Exercise as ExerciseSpec, type Task } from "../lib/api";
import { AppPanel } from "./AppPanel";
import { FileExplorer } from "./FileExplorer";
import { Terminal } from "./Terminal";
import { ProjectTask } from "./ProjectTask";
import { DeployTask } from "./DeployTask";
import { HelpMe } from "./HelpMe";
import { StagedRun } from "./StagedRun";
import { ProvisionTask } from "./ProvisionTask";
import { BillingTask } from "./BillingTask";
import { BudgetAssist, ServicesAssist } from "./BudgetTask";
import { Widget } from "../widgets";

/* The exercise is the second half of every step: concepts above, practice below.

   Five kinds of task:

     intent   the student says what they want, in their own words. If the
              request is right, the command runs in their Cloud Shell. This is
              the default kind, because it's how they'll actually work.
     command  a command the student runs directly, for the few cases where
              there's nothing to work out.
     widget   something interactive to push on, rather than read.
     project  create the course's Google Cloud project, or confirm one made
              by hand, and write its id down.
     billing  attach a billing account to that project.
   A console task may carry an `assist`: a quiet button beside the console
   link that does the same job for anyone who would rather not click through
   it. The console is still the route the step asks for.
     placeholder  space reserved for a diagram that is not drawn yet.
     files    a read-only look around the project, before anything is run.
     terminal a small real shell: pwd, ls, cd, cat, and starting the app.
     provision  an intent whose command builds something slow. The log hides
              behind a button and the panel animates what is being made.
     app      the student's app, running in its own process and embedded here
              through the workbench's proxy.
     console  a link to the Google Cloud console, which can't be embedded and
              shouldn't be: they need to learn the real one.
     reflect  a question with no automatic answer.
     edit     a file the student changes.
*/

function Checklist({ items }: { items: string[] }) {
  const [ticked, setTicked] = useState<Set<number>>(new Set());

  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((item, index) => {
        const done = ticked.has(index);
        return (
          <li key={index}>
            <button
              type="button"
              onClick={() =>
                setTicked((previous) => {
                  const next = new Set(previous);
                  if (next.has(index)) next.delete(index);
                  else next.add(index);
                  return next;
                })
              }
              className="flex w-full items-start gap-2.5 rounded-md px-1.5 py-1 text-left text-sm"
              style={{ color: done ? "var(--fg-faint)" : "var(--fg-muted)" }}
            >
              <span
                className="mt-[3px] grid h-[15px] w-[15px] shrink-0 place-items-center rounded border text-[9px] leading-none"
                style={{
                  borderColor: done ? "var(--ok)" : "var(--hairline-strong)",
                  background: done ? "var(--ok)" : "transparent",
                  color: "var(--card)",
                }}
              >
                {done ? "✓" : ""}
              </span>
              <span className={done ? "line-through" : ""}>{item}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Follows one run: the live stream, then the log file once it ends. */
function useRunStream() {
  const [lines, setLines] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [code, setCode] = useState<number | null>(null);
  const token = useRef<string | null>(null);

  useEffect(
    () =>
      onRunEvent((event) => {
        if (event.token !== token.current) return;
        if (event.type === "run.line") setLines((previous) => [...previous, event.line]);
        if (event.type === "run.done") {
          setState("done");
          setCode(event.code);
          // A buffering proxy can swallow stream lines. The log file can't.
          api
            .runStatus(event.token)
            .then((status) => setLines(status.log.split("\n").filter(Boolean)))
            .catch(() => {});
        }
      }),
    [],
  );

  const begin = useCallback((fresh: string) => {
    token.current = fresh;
    setLines([]);
    setCode(null);
    setState("running");
  }, []);

  const fail = useCallback((message: string) => {
    setState("done");
    setCode(1);
    setLines([message]);
  }, []);

  return { lines, state, code, begin, fail };
}

function RunOutput({
  lines,
  state,
  code,
}: {
  lines: string[];
  state: string;
  code: number | null;
}) {
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep the newest line visible without moving the page around it.
    const panel = body.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [lines.length]);

  if (!lines.length && state === "idle") return null;

  return (
    <div className="mt-3">
      <div className="mb-1.5 text-[0.7rem]" style={{ color: "var(--fg-faint)" }}>
        running in your Cloud Shell
      </div>
      <div
        ref={body}
        className="quiet-scroll max-h-72 overflow-y-auto rounded-2xl border px-4 py-3 font-mono text-[0.76rem] leading-relaxed whitespace-pre-wrap"
        style={{ background: "var(--code-bg)", color: "var(--code-fg)", borderColor: "var(--hairline)" }}
      >
        {lines.join("\n")}
      </div>
      {state === "done" && (
        <div
          className="mt-2 text-xs font-medium"
          style={{ color: code === 0 ? "var(--ok)" : "var(--bad)" }}
        >
          {code === 0 ? "Finished." : `Exited with code ${code}.`}
        </div>
      )}
    </div>
  );
}

function CommandLine({
  command,
  onEdit,
}: {
  command: string;
  onEdit?: (value: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-3 flex items-stretch gap-2">
      <div
        className="quiet-scroll flex-1 overflow-x-auto rounded-2xl border px-4 py-2.5 font-mono text-[0.8rem] leading-relaxed"
        style={{ background: "var(--code-bg)", color: "var(--code-fg)", borderColor: "var(--hairline)" }}
      >
        {onEdit ? (
          <input
            value={command}
            onChange={(event) => onEdit(event.target.value)}
            spellCheck={false}
            className="w-full bg-transparent font-mono outline-none"
            style={{ color: "var(--code-fg)" }}
          />
        ) : (
          <code className="whitespace-pre">{command}</code>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(command);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        className="shrink-0 rounded-lg border px-3 text-xs font-medium"
        style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function IntentTask({ slug, task, color }: { slug: string; task: Task; color: string }) {
  const [utterance, setUtterance] = useState("");
  const [verdict, setVerdict] = useState<{ ok: boolean; feedback: string; by: string } | null>(null);
  const [command, setCommand] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = useRunStream();

  async function send() {
    if (!utterance.trim() || busy) return;
    setBusy(true);
    setVerdict(null);
    try {
      const response = await api.submitIntent(slug, task.id, utterance);
      setVerdict({ ok: response.ok, feedback: response.feedback, by: response.by });
      if (response.ok && response.token) {
        setCommand(response.command);
        run.begin(response.token);
      }
    } catch (error) {
      run.fail(String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {task.prompt && (
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          {task.prompt}
        </p>
      )}

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

      {verdict && (
        <div
          className="mt-3 rounded-2xl border px-4 py-3 text-sm"
          style={{
            background: "var(--overlay)",
            borderColor: "var(--hairline)",
            color: "var(--fg-muted)",
          }}
        >
          <span
            className="mr-2 font-semibold"
            style={{ color: verdict.ok ? "var(--ok)" : "var(--bad)" }}
          >
            {verdict.ok ? "Running it." : "Not yet."}
          </span>
          {verdict.feedback}
        </div>
      )}

      {/* With stages declared, neither the command nor its output is the
          lesson, so both stay behind the panel. */}
      {task.stages?.length ? (
        run.state !== "idle" && (
          <StagedRun
            stages={task.stages}
            lines={run.lines}
            state={run.state === "done" ? (run.code === 0 ? "done" : "failed") : "running"}
            running="setting it up…"
            done="ready"
            failed="that did not finish — the log says why"
          />
        )
      ) : (
        <>
          {command && (
            <div className="mt-3">
              <div className="mb-1.5 text-[0.7rem]" style={{ color: "var(--fg-faint)" }}>
                What that turned into:
              </div>
              <CommandLine command={command} />
            </div>
          )}
          <RunOutput lines={run.lines} state={run.state} code={run.code} />
        </>
      )}
    </>
  );
}

function CommandTask({ slug, task, color }: { slug: string; task: Task; color: string }) {
  const [command, setCommand] = useState(task.command ?? "");
  const run = useRunStream();

  async function start() {
    try {
      const { token } = await api.startRun(slug, task.id);
      run.begin(token);
    } catch (error) {
      run.fail(String(error));
    }
  }

  return (
    <>
      {task.explain && (
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          {task.explain}
        </p>
      )}
      <CommandLine command={command} onEdit={task.editable ? setCommand : undefined} />
      {task.editable && (
        <p className="mt-1.5 text-xs" style={{ color: "var(--fg-faint)" }}>
          Edit this before you run it. The values are yours.
        </p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={start}
          disabled={run.state === "running"}
          className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          style={{ background: color }}
        >
          {run.state === "running" ? "Running…" : "Run in Cloud Shell"}
        </button>
        {task.note && (
          <span className="text-xs" style={{ color: "var(--fg-faint)" }}>
            {task.note}
          </span>
        )}
      </div>
      <RunOutput lines={run.lines} state={run.state} code={run.code} />
    </>
  );
}

function ConsoleTask({ task, color }: { task: Task; color: string }) {
  return (
    <>
      {task.explain && (
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          {task.explain}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={task.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium text-white"
          style={{ background: color }}
        >
          Open the console
          <span aria-hidden>↗</span>
        </a>
        {task.assist === "budget" && <BudgetAssist />}
        {task.assist === "services" && <ServicesAssist />}
      </div>
      <div className="mt-1.5 text-xs" style={{ color: "var(--fg-faint)" }}>
        Opens in a new tab. Return here when you're done.
      </div>
      {task.checklist && <Checklist items={task.checklist} />}
    </>
  );
}

function ReflectTask({ task }: { task: Task }) {
  return (
    <>
      {task.prompt && (
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          {task.prompt}
        </p>
      )}

      {task.linkTo && (
        <button
          type="button"
          onClick={() => {
            // Send the reader back to a panel further up rather than showing a
            // second copy of it.
            document
              .getElementById(`task-${task.linkTo}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-sm"
          style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
        >
          <span aria-hidden>↑</span>
          {task.linkLabel ?? "Back to the app above"}
        </button>
      )}

      {task.checklist && <Checklist items={task.checklist} />}
    </>
  );
}

function PlaceholderTask({ task, kind }: { task: Task; kind: string }) {
  return (
    <div
      className="mt-3 rounded-lg border border-dashed px-4 py-3 text-sm"
      style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-faint)" }}
    >
      <strong style={{ color: "var(--fg-muted)" }}>{kind} task</strong> — not built yet.
      {task.prompt && <div className="mt-1.5">{task.prompt}</div>}
      {task.file && <div className="mt-1.5 font-mono text-xs">{task.file}</div>}
    </div>
  );
}

export function Exercise({
  slug,
  exercise,
  color,
}: {
  slug: string;
  exercise: ExerciseSpec;
  color: string;
}) {
  return (
    <section className="mt-14">
      <div
        className="rounded-3xl border p-6 sm:p-8"
        style={{ background: "var(--card)", borderColor: "var(--hairline)" }}
      >
        <div className="kicker" style={{ color }}>
          Your turn
        </div>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{exercise.title}</h2>
        {exercise.intro && (
          <p className="mt-2 max-w-2xl text-[0.95rem]" style={{ color: "var(--fg-muted)" }}>
            {exercise.intro}
          </p>
        )}

        <ol className="mt-7 space-y-7">
          {exercise.tasks.map((task, index) => (
            <li key={task.id} id={`task-${task.id}`} className="flex gap-4">
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-semibold"
                style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[0.98rem] font-semibold">{task.title}</h3>
                {task.kind === "intent" && <IntentTask slug={slug} task={task} color={color} />}
                {task.kind === "command" && <CommandTask slug={slug} task={task} color={color} />}
                {task.kind === "widget" && (
                  <>
                    {task.explain && (
                      <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
                        {task.explain}
                      </p>
                    )}
                    <Widget id={task.widget ?? ""} />
                  </>
                )}
                {task.kind === "deploy" && (
                  <DeployTask slug={slug} task={task} color={color} />
                )}
                {task.kind === "provision" && (
                  <ProvisionTask slug={slug} task={task} color={color} />
                )}
                {task.kind === "project" && <ProjectTask task={task} color={color} />}
                {task.kind === "billing" && <BillingTask task={task} color={color} />}
                {task.kind === "placeholder" && (
                  <div
                    className="mt-3 grid min-h-28 place-items-center rounded-2xl border border-dashed px-4 text-center text-sm"
                    style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-faint)" }}
                  >
                    {task.note ?? "diagram goes here"}
                  </div>
                )}
                {task.kind === "files" && (
                  <FileExplorer
                    start={task.start}
                    open={task.open}
                    explain={task.explain}
                    slug={slug}
                    task={task}
                    color={color}
                  />
                )}
                {task.kind === "terminal" && (
                  <Terminal explain={task.explain} hint={task.hint} expect={task.expect} />
                )}
                {task.kind === "app" && (
                  <AppPanel title={task.appTitle} explain={task.explain} color={color} />
                )}
                {task.kind === "console" && <ConsoleTask task={task} color={color} />}
                {task.kind === "reflect" && <ReflectTask task={task} />}
                {(task.kind === "edit" || task.kind === "draw") && (
                  <PlaceholderTask task={task} kind={task.kind} />
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
