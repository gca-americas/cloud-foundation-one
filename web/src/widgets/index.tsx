/* Interactive pieces a step can drop into an exercise by id.

   A figure explains something; a widget lets the student push on it. Kept in
   their own registry so a step asks for one by name, the way it asks for a
   figure. */

import type { ReactNode } from "react";

import { CostCurve } from "./CostCurve";
import { Globe } from "./Globe";
import { RegionQuiz } from "./RegionQuiz";

const WIDGETS: Record<string, () => ReactNode> = {
  "cost-curve": CostCurve,
  globe: Globe,
  "region-quiz": RegionQuiz,
};

export function Widget({ id }: { id: string }) {
  const Piece = WIDGETS[id];

  if (!Piece) {
    return (
      <div
        className="mt-4 grid h-28 place-items-center rounded-2xl border border-dashed text-sm"
        style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-faint)" }}
      >
        widget “{id || "unnamed"}” not built yet
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Piece />
    </div>
  );
}
