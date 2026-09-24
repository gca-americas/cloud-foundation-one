import type { ReactNode } from "react";

/* `like this` inside a task's prose.

   Step bodies go through a markdown renderer, so backticks there become code
   already. Task fields -- prompt, explain, hint, feedback, checklist items --
   are plain strings rendered straight into the page, so an author's backticks
   showed up as backticks. A command or a filename set in the body font is
   harder to read and easy to mistype.

   Inline code only. These are single sentences inside styled panels, so
   running them through the whole markdown renderer would invite block
   elements into places that cannot hold them. */

export function Ticks({ children }: { children?: string }): ReactNode {
  if (!children) return null;
  if (!children.includes("`")) return children;

  // Odd positions are the runs between backticks.
  return children.split("`").map((piece, index) =>
    index % 2 === 1 ? (
      <code key={index} className="tick">
        {piece}
      </code>
    ) : (
      piece
    ),
  );
}
