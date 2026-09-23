import { useMemo } from "react";

import { parseBlocks, type Block } from "../lib/blocks";
import { Figure } from "../illustrations";

/* Panels, following the workbench house style: a full hairline border on a
   translucent panel, never a coloured edge. A callout is distinguished by its
   kicker, not by a stripe -- which is what lets panels nest without the page
   turning into a stack of bars. */

const CALLOUT = {
  key: { label: "The point", color: "var(--accent)" },
  note: { label: "Worth knowing", color: "var(--fg-faint)" },
  warn: { label: "Careful", color: "var(--amber)" },
} as const;

function Callout({ variant, html }: { variant: keyof typeof CALLOUT; html: string }) {
  const { label, color } = CALLOUT[variant];
  return (
    <aside
      className="my-6 rounded-2xl border p-5"
      style={{ borderColor: "var(--hairline)", background: "var(--overlay)" }}
    >
      <div className="kicker mb-2" style={{ color }}>
        {label}
      </div>
      <div
        className="prose [&>p:last-child]:mb-0 [&>p]:text-[var(--fg)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </aside>
  );
}

function Section({
  kicker,
  headline,
  children,
}: {
  kicker: string;
  headline: string;
  children: Block[];
}) {
  return (
    <section
      className="my-7 rounded-3xl border p-6 sm:p-8"
      style={{ borderColor: "var(--hairline)", background: "var(--card)" }}
    >
      {kicker && (
        <div className="kicker" style={{ color: "var(--fg-faint)" }}>
          {kicker}
        </div>
      )}
      {headline && (
        <h2 className="display text-balance mt-3 mb-5 text-[1.5rem] leading-[1.2]">
          {headline}
        </h2>
      )}
      <Blocks blocks={children} />
    </section>
  );
}

function Columns({ children }: { children: Block[][] }) {
  return (
    <div
      className="my-6 grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))" }}
    >
      {children.map((column, index) => (
        <div
          key={index}
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--hairline)", background: "var(--overlay)" }}
        >
          <Blocks blocks={column} />
        </div>
      ))}
    </div>
  );
}

/* The console cannot be embedded -- it refuses to be framed -- so the best the
   workbench can do is open it in a tab, pointed at the right page. */
function ConsoleLink({ url, label, note }: { url: string; label: string; note: string }) {
  return (
    <div className="my-4 flex flex-wrap items-center gap-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border px-3.5 py-1.5 text-sm font-medium"
        style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
      >
        {label} ↗
      </a>
      {note && (
        <span className="text-xs" style={{ color: "var(--fg-faint)" }}>
          {note}
        </span>
      )}
    </div>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.kind === "figure") {
          return <Figure key={index} id={block.id} caption={block.caption} />;
        }
        if (block.kind === "console") {
          return (
            <ConsoleLink key={index} url={block.url} label={block.label} note={block.note} />
          );
        }
        if (block.kind === "callout") {
          return <Callout key={index} variant={block.variant} html={block.html} />;
        }
        if (block.kind === "section") {
          return (
            <Section key={index} kicker={block.kicker} headline={block.headline}>
              {block.children}
            </Section>
          );
        }
        if (block.kind === "columns") {
          return <Columns key={index}>{block.children}</Columns>;
        }
        return (
          <div
            key={index}
            className="prose table-scroll quiet-scroll"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        );
      })}
    </>
  );
}

/** A part's teaching content: markdown, section panels, callouts, figures. */
export function Content({ markdown }: { markdown: string }) {
  const blocks = useMemo(() => parseBlocks(markdown), [markdown]);
  return <Blocks blocks={blocks} />;
}
