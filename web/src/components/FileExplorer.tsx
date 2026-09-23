import { useCallback, useEffect, useRef, useState } from "react";

import { api, type FileNode, type Task } from "../lib/api";
import { HelpMe } from "./HelpMe";

/* A read-only look around the project.

   Reading comes before running: a student should be able to see what the app
   is made of before being asked to start it. Editing arrives later in the
   course; for now this only opens files. */

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className="inline-block w-3 text-[9px] transition-transform"
      style={{ color: "var(--fg-faint)", transform: open ? "rotate(90deg)" : "none" }}
    >
      ▶
    </span>
  );
}

function Row({
  node,
  depth,
  openDirs,
  toggle,
  selected,
  select,
}: {
  node: FileNode;
  depth: number;
  openDirs: Set<string>;
  toggle: (path: string) => void;
  selected: string;
  select: (path: string) => void;
}) {
  const isOpen = openDirs.has(node.path);
  const isSelected = node.path === selected;

  return (
    <>
      <button
        type="button"
        onClick={() => (node.kind === "dir" ? toggle(node.path) : select(node.path))}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-[3px] text-left font-mono text-[0.74rem]"
        style={{
          paddingLeft: 8 + depth * 13,
          background: isSelected ? "var(--overlay)" : "transparent",
          color: isSelected
            ? "var(--fg)"
            : node.kind === "dir"
              ? "var(--fg-muted)"
              : "var(--fg-muted)",
        }}
      >
        {node.kind === "dir" ? <Chevron open={isOpen} /> : <span className="w-3" />}
        <span className="truncate">
          {node.name}
          {node.kind === "dir" ? "/" : ""}
        </span>
      </button>

      {node.kind === "dir" &&
        isOpen &&
        (node.children ?? []).map((child) => (
          <Row
            key={child.path}
            node={child}
            depth={depth + 1}
            openDirs={openDirs}
            toggle={toggle}
            selected={selected}
            select={select}
          />
        ))}
    </>
  );
}

export function FileExplorer({
  start = "",
  open = "",
  explain,
  slug,
  task,
  color,
}: {
  start?: string;
  open?: string;
  explain?: string;
  /** When the task carries an `expect`, a request box appears above the tree
      and the file is re-read once the command it triggers has run. */
  slug?: string;
  task?: Task;
  color?: string;
}) {
  const [entries, setEntries] = useState<FileNode[]>([]);
  const [root, setRoot] = useState("");
  const [where, setWhere] = useState("");
  const [openDirs, setOpenDirs] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState("");
  const [lines, setLines] = useState<string[] | null>(null);
  const [problem, setProblem] = useState("");
  const [utterance, setUtterance] = useState("");
  const [verdict, setVerdict] = useState<{ ok: boolean; feedback: string } | null>(null);
  const [asking, setAsking] = useState(false);
  const [changed, setChanged] = useState<[number, number] | null>(null);
  const [resetting, setResetting] = useState(false);
  const code = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .fileTree(start, 4)
      .then((payload) => {
        setEntries(payload.entries);
        setRoot(payload.root);
        setWhere(payload.display);
        // Open the folders on the way to the file a step wants shown.
        if (open) {
          const parts = open.split("/").slice(0, -1);
          const paths = parts.map((_, index) => parts.slice(0, index + 1).join("/"));
          setOpenDirs(new Set(paths));
        }
      })
      .catch(() => setProblem("could not read the project"));
  }, [start, open]);

  const show = useCallback(async (path: string, keepHighlight = false) => {
    setSelected(path);
    setLines(null);
    setProblem("");
    if (!keepHighlight) setChanged(null);
    try {
      const file = await api.fileRead(path);
      if (file.error) {
        setProblem(file.error);
        return null;
      }
      setLines(file.lines ?? null);
      return file.lines ?? null;
    } catch {
      setProblem("could not read that file");
      return null;
    }
  }, []);

  /** The band of lines that differ, found from both ends. A step rewrites one
      contiguous section, so this is exact rather than a guess. */
  function bandBetween(before: string[], after: string[]): [number, number] | null {
    let top = 0;
    while (top < before.length && top < after.length && before[top] === after[top]) top += 1;
    let fromEnd = 0;
    while (
      fromEnd < before.length - top &&
      fromEnd < after.length - top &&
      before[before.length - 1 - fromEnd] === after[after.length - 1 - fromEnd]
    ) {
      fromEnd += 1;
    }
    const last = after.length - 1 - fromEnd;
    return last >= top ? [top, last] : null;
  }

  useEffect(() => {
    if (open) show(open);
  }, [open, show]);

  async function ask() {
    if (!slug || !task || !utterance.trim() || asking) return;
    setAsking(true);
    setVerdict(null);
    setChanged(null);
    const before = lines;
    try {
      const response = await api.submitIntent(slug, task.id, utterance);
      setVerdict({ ok: response.ok, feedback: response.feedback });
      if (response.ok && response.token) {
        // Let the command finish, then show what it did to the file.
        await new Promise((resolve) => setTimeout(resolve, 2200));
        const target = selected || open;
        if (target) {
          const after = await show(target, true);
          if (before && after) setChanged(bandBetween(before, after));
        }
      }
    } catch {
      setVerdict({ ok: false, feedback: "the workbench did not answer" });
    } finally {
      setAsking(false);
    }
  }

  async function reset() {
    if (resetting) return;
    setResetting(true);
    setChanged(null);
    setVerdict(null);
    try {
      await api.appReset();
      const target = selected || open;
      if (target) await show(target);
    } finally {
      setResetting(false);
    }
  }

  useEffect(() => {
    if (!changed || !code.current) return;
    // Scroll this pane, never the page.
    const lineHeight = code.current.scrollHeight / Math.max(1, lines?.length ?? 1);
    code.current.scrollTop = Math.max(0, changed[0] * lineHeight - 40);
  }, [changed, lines]);

  function toggle(path: string) {
    setOpenDirs((previous) => {
      const next = new Set(previous);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <div className="mt-4">
      {explain && (
        <p className="mb-3 text-sm" style={{ color: "var(--fg-muted)" }}>
          {explain}
        </p>
      )}

      {task?.expect && slug && (
        <div className="mb-3">
          <textarea
            value={utterance}
            onChange={(event) => setUtterance(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) ask();
            }}
            rows={2}
            placeholder="Describe the change you want, the way you'd ask an assistant…"
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
              onClick={ask}
              disabled={asking || !utterance.trim()}
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: color ?? "var(--accent)" }}
            >
              {asking ? "Working…" : "Send"}
            </button>
            <HelpMe example={task.example} onUse={setUtterance} />
            <span className="text-xs" style={{ color: "var(--fg-faint)" }}>
              The file below changes if the request is clear enough to act on.
            </span>
          </div>

          {verdict && (
            <p
              className="mt-2 text-sm"
              style={{ color: verdict.ok ? "var(--fg-muted)" : "var(--bad)" }}
            >
              {verdict.ok ? "" : "Not yet. "}
              {verdict.feedback}
            </p>
          )}

          {asking && (
            <div className="working-bar mt-2 h-[3px] w-full rounded-full" aria-hidden />
          )}

          {changed && !asking && (
            <p className="mt-2 text-sm" style={{ color: "var(--accent)" }}>
              {changed[1] - changed[0] + 1} lines changed, highlighted below.
            </p>
          )}
        </div>
      )}

      <div
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: "var(--hairline)", background: "var(--card)" }}
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-2.5"
          style={{ borderColor: "var(--hairline)" }}
        >
          <span className="kicker" style={{ color: "var(--fg-faint)" }}>
            Files
          </span>
          <span className="font-mono text-[0.72rem]" style={{ color: "var(--fg)" }}>
            {where || "~"}
          </span>
          <span className="font-mono text-[0.72rem]" style={{ color: "var(--fg-faint)" }}>
            {selected
              ? `/ ${root && selected.startsWith(root + "/") ? selected.slice(root.length + 1) : selected}`
              : "· select a file"}
          </span>
          <span className="ml-auto text-[0.68rem]" style={{ color: "var(--fg-faint)" }}>
            read only
          </span>
          {task?.expect && (
            <button
              type="button"
              onClick={reset}
              disabled={resetting}
              title="Put app/ back to the state the course starts from. Nothing in your project is touched."
              className="rounded-full border px-2.5 py-[2px] text-[0.68rem] disabled:opacity-50"
              style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
            >
              {resetting ? "Rewinding…" : "Reset code"}
            </button>
          )}
        </div>

        <div className="grid" style={{ gridTemplateColumns: "minmax(9rem, 13rem) 1fr" }}>
          <div
            className="quiet-scroll overflow-auto border-r py-2"
            style={{ borderColor: "var(--hairline)", maxHeight: 420 }}
          >
            {root && (
              <div
                className="mb-1 flex items-center gap-1.5 px-2 py-[3px] font-mono text-[0.74rem]"
                style={{ color: "var(--fg)" }}
                title={where}
              >
                <span className="w-3 text-[9px]" style={{ color: "var(--fg-faint)" }}>
                  ▾
                </span>
                <span className="truncate">{root.split("/").pop()}/</span>
              </div>
            )}
            {entries.map((node) => (
              <Row
                key={node.path}
                node={node}
                depth={root ? 1 : 0}
                openDirs={openDirs}
                toggle={toggle}
                selected={selected}
                select={show}
              />
            ))}
          </div>

          <div
            ref={code}
            className="quiet-scroll overflow-auto"
            style={{ maxHeight: 420, background: "var(--code-bg)" }}
          >
            {problem ? (
              <p className="p-4 font-mono text-[0.75rem]" style={{ color: "var(--bad)" }}>
                {problem}
              </p>
            ) : lines ? (
              <pre className="m-0 p-3 font-mono text-[0.73rem] leading-[1.55]">
                {lines.map((line, index) => {
                  const lit = changed !== null && index >= changed[0] && index <= changed[1];
                  return (
                    <div key={index} className={`flex ${lit ? "line-changed" : ""}`}>
                      <span
                        className="w-9 shrink-0 pr-3 text-right select-none"
                        style={{
                          color: lit ? "var(--accent)" : "var(--fg-faint)",
                          opacity: lit ? 0.9 : 0.55,
                        }}
                      >
                        {index + 1}
                      </span>
                      <span style={{ color: "var(--code-fg)", whiteSpace: "pre-wrap" }}>
                        {line || " "}
                      </span>
                    </div>
                  );
                })}
              </pre>
            ) : (
              <p
                className="p-4 font-mono text-[0.75rem]"
                style={{ color: "var(--fg-faint)" }}
              >
                Pick a file on the left.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
