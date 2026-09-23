import { useState } from "react";

/* What it costs to serve traffic, both ways.

   The mistake this widget exists to correct is thinking the machines are the
   expense. They are the cheapest line. The expensive parts are the people, the
   second site you need so one site can fail, and the capacity you buy for the
   busiest hour and then own for all the quiet ones.

   None of those are fixed. Grow the fleet and you need more engineers, more
   space, more links. Rent instead and the unit price goes *down* as you grow,
   because providers discount volume. So the gap widens in both directions:
   renting is cheaper when you have nothing, and cheaper again when you have a
   lot.

   Figures are rough monthly costs for a small to mid-size service. They are the
   right order of magnitude, which is what the comparison needs. */

const ENGINEER = 11_000; // one loaded engineer, on call
const MACHINES_PER_ENGINEER = 12;

const SITE = 2_400; // a rack somewhere: space, cooling, two links, backup power
const MACHINES_PER_SITE = 16;

const MACHINE = 190; // a $6k server over four years, plus its power and cooling
const CAPACITY = 20; // units of traffic one machine serves
const SPARE = 1; // one more than you need, so one can fail

// Rented capacity gets cheaper per unit as you use more of it.
const TIERS: [number, number][] = [
  [100, 30],
  [400, 24],
  [Infinity, 19],
];

const MAX_TRAFFIC = 800;
const W = 560;
const H = 240;
const PAD = { left: 66, right: 18, top: 18, bottom: 36 };

const machinesFor = (traffic: number, peak: number) =>
  Math.ceil((traffic * peak) / CAPACITY) + SPARE;

const engineersFor = (machines: number) =>
  Math.max(1, Math.ceil(machines / MACHINES_PER_ENGINEER));

const sitesFor = (machines: number) =>
  Math.max(1, Math.ceil(machines / MACHINES_PER_SITE));

function ownedParts(traffic: number, peak: number) {
  const machines = machinesFor(traffic, peak);
  const engineers = engineersFor(machines);
  const sites = sitesFor(machines);
  return {
    machines,
    engineers,
    sites,
    people: engineers * ENGINEER,
    space: sites * SITE,
    hardware: machines * MACHINE,
    total: engineers * ENGINEER + sites * SITE + machines * MACHINE,
  };
}

function cloudCost(traffic: number): number {
  let left = traffic;
  let total = 0;
  let previous = 0;
  for (const [upTo, price] of TIERS) {
    const band = Math.min(left, upTo - previous);
    if (band <= 0) break;
    total += band * price;
    left -= band;
    previous = upTo;
    if (left <= 0) break;
  }
  return total;
}

const money = (value: number) =>
  value >= 10_000
    ? "$" + Math.round(value / 1000) + "k"
    : "$" + Math.round(value).toLocaleString();

export function CostCurve() {
  const [traffic, setTraffic] = useState(80);
  const [peak, setPeak] = useState(2);

  const top = ownedParts(MAX_TRAFFIC, 2).total;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (t: number) => PAD.left + (t / MAX_TRAFFIC) * plotW;
  const y = (cost: number) => PAD.top + plotH - (Math.min(cost, top) / top) * plotH;

  const sample = Array.from({ length: 81 }, (_, i) => Math.max(1, i * 10));
  const ownedLine = sample
    .map((t, i) => `${i === 0 ? "M" : "L"}${x(t)} ${y(ownedParts(t, peak).total)}`)
    .join(" ");
  const cloudLine = sample
    .map((t, i) => `${i === 0 ? "M" : "L"}${x(t)} ${y(cloudCost(t))}`)
    .join(" ");
  const gap =
    ownedLine +
    " " +
    sample
      .slice()
      .reverse()
      .map((t) => `L${x(t)} ${y(cloudCost(t))}`)
      .join(" ") +
    " Z";

  const own = ownedParts(traffic, peak);
  const cloud = cloudCost(traffic);
  const times = own.total / Math.max(cloud, 1);

  const breakdown = [
    [`${own.engineers} engineer${own.engineers === 1 ? "" : "s"}, on call`, own.people],
    [`${own.sites} site${own.sites === 1 ? "" : "s"}, powered and connected`, own.space],
    [`${own.machines} machines (one spare)`, own.hardware],
  ] as const;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round((top * f) / 1000) * 1000);

  return (
    <div>
      <div
        className="rounded-2xl border p-4"
        style={{ borderColor: "var(--hairline)", background: "var(--overlay)" }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img"
             aria-label="Monthly cost of running your own infrastructure compared with renting it">
          <line x1={PAD.left} y1={y(0)} x2={W - PAD.right} y2={y(0)}
                stroke="var(--hairline-strong)" />
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={y(0)}
                stroke="var(--hairline-strong)" />

          {ticks.map((value) => (
            <text key={value} x={PAD.left - 8} y={y(value) + 4} textAnchor="end"
                  style={{ fontSize: 10, fill: "var(--fg-faint)", fontFamily: "inherit" }}>
              {money(value)}
            </text>
          ))}

          <path d={gap} fill="var(--accent)" opacity="0.10" />
          <path d={ownedLine} fill="none" stroke="var(--red)" strokeWidth="2" />
          <path d={cloudLine} fill="none" stroke="var(--accent)" strokeWidth="2" />

          <text x={x(MAX_TRAFFIC)} y={y(ownedParts(MAX_TRAFFIC, peak).total) - 8}
                textAnchor="end"
                style={{ fontSize: 10, fill: "var(--red)", fontFamily: "inherit" }}>
            own it
          </text>
          <text x={x(MAX_TRAFFIC)} y={y(cloudCost(MAX_TRAFFIC)) + 16} textAnchor="end"
                style={{ fontSize: 10, fill: "var(--accent)", fontFamily: "inherit" }}>
            rent it
          </text>

          <line x1={x(traffic)} y1={PAD.top} x2={x(traffic)} y2={y(0)}
                stroke="var(--fg-faint)" strokeDasharray="4 4" />
          <circle cx={x(traffic)} cy={y(own.total)} r="4.5" fill="var(--red)" />
          <circle cx={x(traffic)} cy={y(cloud)} r="4.5" fill="var(--accent)" />

          <text x={PAD.left} y={H - 10}
                style={{ fontSize: 10, fill: "var(--fg-faint)", fontFamily: "inherit" }}>
            no users yet
          </text>
          <text x={W - PAD.right} y={H - 10} textAnchor="end"
                style={{ fontSize: 10, fill: "var(--fg-faint)", fontFamily: "inherit" }}>
            a busy service
          </text>
        </svg>

        <div className="mt-3 grid gap-4"
             style={{ gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))" }}>
          <label className="block">
            <span className="kicker" style={{ color: "var(--fg-faint)" }}>How much traffic</span>
            <input type="range" min={1} max={MAX_TRAFFIC} value={traffic}
                   onChange={(event) => setTraffic(Number(event.target.value))}
                   className="mt-1 w-full" style={{ accentColor: "var(--accent)" }} />
          </label>
          <label className="block">
            <span className="kicker" style={{ color: "var(--fg-faint)" }}>
              Busiest hour · {peak}× the average
            </span>
            <input type="range" min={1} max={4} step={1} value={peak}
                   onChange={(event) => setPeak(Number(event.target.value))}
                   className="mt-1 w-full" style={{ accentColor: "var(--red)" }} />
          </label>
        </div>

        <div className="mt-5 grid gap-5"
             style={{ gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))" }}>
          <div>
            <div className="kicker" style={{ color: "var(--red)" }}>
              Own it · {money(own.total)} a month
            </div>
            <ul className="mt-2 space-y-1">
              {breakdown.map(([label, value]) => (
                <li key={label}
                    className="flex items-baseline justify-between gap-3 text-[0.78rem]">
                  <span style={{ color: "var(--fg-muted)" }}>{label}</span>
                  <span className="font-mono" style={{ color: "var(--fg)" }}>{money(value)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="kicker" style={{ color: "var(--accent)" }}>
              Rent it · {money(cloud)} a month
            </div>
            <p className="mt-2 text-[0.78rem]" style={{ color: "var(--fg-muted)" }}>
              Every line on the left is the provider's problem, and the price per
              unit falls as you use more.
            </p>
            <p className="mt-3 font-mono text-[0.95rem]" style={{ color: "var(--accent)" }}>
              {times >= 2 ? `${times.toFixed(1)}× cheaper` : money(own.total - cloud) + " cheaper"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm" style={{ color: "var(--fg-muted)" }}>
        Drag it to the far left. With no users at all, renting costs almost
        nothing and owning still costs an engineer, a room and a spare machine —
        you pay for the whole thing before your first visitor arrives.
      </p>

      <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
        Now drag it right. The red line climbs in steps, because scale is not
        only machines: it is another engineer for the rota, and a second site so
        one site can fail. The blue line bends the other way, because rented
        capacity gets cheaper per unit the more you take.
      </p>

      <p className="mt-2 text-xs" style={{ color: "var(--fg-faint)" }}>
        Rough monthly figures for a small to mid-size service, not quotes. At
        genuinely huge and very steady scale the arithmetic can turn around,
        which is why a handful of very large companies do run their own. You are
        not one of them yet.
      </p>
    </div>
  );
}
