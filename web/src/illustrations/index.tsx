/* Hand-drawn figures, referenced from markdown by id.

   Inline SVG rather than image files, because every figure has to work in both
   themes -- they use the same CSS variables the rest of the page does, so a
   figure is never a light-mode picture sitting in a dark-mode page.

   House style: one idea per figure, labels in the page's own font, the accent
   colour for the thing being taught and hairlines for everything else.
*/

import type { ReactNode } from "react";

import { Globe } from "../widgets/Globe";

const label = { fontSize: 11, fill: "var(--fg-muted)", fontFamily: "inherit" } as const;
const faint = { fontSize: 10.5, fill: "var(--fg-faint)", fontFamily: "inherit" } as const;
const strong = { fontSize: 12, fill: "var(--fg)", fontWeight: 600, fontFamily: "inherit" } as const;
const mono = { fontSize: 10.5, fill: "var(--fg-muted)", fontFamily: "ui-monospace, monospace" } as const;

function Arrow({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
      <path d="M0 0 L7 3.5 L0 7 z" fill={color} />
    </marker>
  );
}

function Box({
  x, y, w = 110, h = 46, title, note, accent = false,
}: {
  x: number; y: number; w?: number; h?: number;
  title: string; note?: string; accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx="8"
        fill={accent ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "var(--card)"}
        stroke={accent ? "var(--accent)" : "var(--hairline-strong)"}
      />
      <text x={x + w / 2} y={note ? y + h / 2 - 2 : y + h / 2 + 4}
            textAnchor="middle" style={strong}>
        {title}
      </text>
      {note && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" style={faint}>
          {note}
        </text>
      )}
    </g>
  );
}

/* ── step 0 ─────────────────────────────────────────────────────────────── */

function Localhost() {
  return (
    <svg viewBox="0 0 520 180" role="img"
         aria-label="A request leaving the browser and returning to the same machine">
      <rect x="30" y="26" width="270" height="118" rx="10"
            fill="var(--overlay)" stroke="var(--hairline-strong)" />
      <text x="46" y="46" style={strong}>one computer</text>

      <Box x={52} y={64} w={94} h={44} title="browser" />
      <Box x={196} y={64} w={94} h={44} title="your app" accent />

      <path d="M148 78 h46" stroke="var(--accent)" strokeWidth="2" fill="none"
            markerEnd="url(#a-acc)" />
      <path d="M194 98 h-46" stroke="var(--accent)" strokeWidth="2" fill="none"
            markerEnd="url(#a-acc)" />

      <line x1="336" y1="22" x2="336" y2="152" stroke="var(--hairline-strong)"
            strokeDasharray="4 5" />
      <text x="356" y="80" style={label}>everyone</text>
      <text x="356" y="96" style={label}>else</text>

      <path d="M302 88 h22" stroke="var(--bad)" strokeWidth="2" strokeDasharray="4 4" />
      <text x="298" y="126" style={{ ...faint, fill: "var(--bad)" }}>never arrives</text>

      <defs><Arrow id="a-acc" color="var(--accent)" /></defs>
    </svg>
  );
}

function FourProblems() {
  const items = [
    ["always on", ["a computer that", "never sleeps"]],
    ["an address", ["one the whole", "internet can reach"]],
    ["an operator", ["power, cooling,", "failed disks"]],
    ["a payer", ["someone settles", "the bill"]],
  ] as const;

  return (
    <svg viewBox="0 0 520 152" role="img" aria-label="The four requirements, side by side">
      {items.map(([title, lines], index) => (
        <g key={title}>
          <rect x={16 + index * 124} y="28" width="112" height="90" rx="9"
                fill="var(--card)" stroke="var(--hairline-strong)" />
          <circle cx={32 + index * 124} cy="48" r="9"
                  fill="color-mix(in srgb, var(--accent) 20%, transparent)"
                  stroke="var(--accent)" />
          <text x={32 + index * 124} y="52" textAnchor="middle"
                style={{ ...faint, fill: "var(--accent)" }}>{index + 1}</text>
          <text x={30 + index * 124} y="80" style={strong}>{title}</text>
          <text x={30 + index * 124} y="98" style={faint}>{lines[0]}</text>
          <text x={30 + index * 124} y="112" style={faint}>{lines[1]}</text>
        </g>
      ))}
    </svg>
  );
}


function PreviewTunnel() {
  return (
    <svg viewBox="0 0 520 170" role="img"
         aria-label="A preview URL that works for you and refuses everyone else">
      <Box x={22} y={62} w={96} h={46} title="you" note="signed in" accent />
      <Box x={212} y={62} w={110} h={46} title="Cloud Shell" note="port 8080" />
      <Box x={396} y={62} w={102} h={46} title="a friend" note="not signed in" />

      <path d="M120 78 h88" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#b-acc)" />
      <text x="132" y="70" style={faint}>preview URL</text>

      <path d="M394 85 h-66" stroke="var(--bad)" strokeWidth="2" strokeDasharray="5 4"
            markerEnd="url(#b-bad)" />
      <text x="330" y="126" style={{ ...faint, fill: "var(--bad)" }}>sign-in page, not your app</text>

      <defs>
        <Arrow id="b-acc" color="var(--accent)" />
        <Arrow id="b-bad" color="var(--bad)" />
      </defs>
    </svg>
  );
}

/* ── step 0 · the app ───────────────────────────────────────────────────── */

function AppShape() {
  return (
    <svg viewBox="0 0 520 180" role="img"
         aria-label="A browser talking to one Python process that serves the page and the scores">
      <Box x={18} y={62} w={104} h={50} title="browser" note="plays the game" />

      <rect x={186} y={30} width={150} height={118} rx="10"
            fill="color-mix(in srgb, var(--accent) 10%, transparent)"
            stroke="var(--accent)" />
      <text x={261} y={50} textAnchor="middle" style={strong}>main.py</text>
      <text x={261} y={70} textAnchor="middle" style={faint}>one process</text>

      <rect x={204} y={82} width={114} height={24} rx="6"
            fill="var(--card)" stroke="var(--hairline-strong)" />
      <text x={261} y={98} textAnchor="middle" style={mono}>serves the page</text>

      <rect x={204} y={112} width={114} height={24} rx="6"
            fill="var(--card)" stroke="var(--hairline-strong)" />
      <text x={261} y={128} textAnchor="middle" style={mono}>keeps the scores</text>

      <path d="M124 78 h58" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#s-acc)" />
      <path d="M182 98 h-58" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#s-acc)" />

      <Box x={392} y={62} w={110} h={50} title="static/" note="game, sprite, audio" />
      <path d="M338 88 h50" stroke="var(--hairline-strong)" strokeDasharray="3 3" />

      <defs><Arrow id="s-acc" color="var(--accent)" /></defs>
    </svg>
  );
}

function ScoresInMemory() {
  const rows = [["rex", "310"], ["ada", "255"], ["sam", "190"]];

  return (
    <svg viewBox="0 0 520 190" role="img"
         aria-label="A leaderboard held in the process, empty again after a restart">
      <rect x={16} y={28} width={210} height={130} rx="10"
            fill="var(--card)" stroke="var(--hairline-strong)" />
      <text x={32} y={50} style={strong}>while it runs</text>
      {rows.map(([name, points], index) => (
        <g key={name}>
          <text x={32} y={76 + index * 22} style={mono}>{name}</text>
          <text x={196} y={76 + index * 22} textAnchor="end" style={mono}>{points}</text>
          <line x1={32} y1={82 + index * 22} x2={196} y2={82 + index * 22}
                stroke="var(--hairline)" />
        </g>
      ))}

      <path d="M240 92 h48" stroke="var(--bad)" strokeWidth="2" markerEnd="url(#m-bad)" />
      <text x={244} y={82} style={{ ...faint, fill: "var(--bad)" }}>restart</text>

      <rect x={300} y={28} width={204} height={130} rx="10"
            fill="var(--card)" stroke="var(--hairline-strong)" strokeDasharray="5 4" />
      <text x={316} y={50} style={strong}>after a restart</text>
      <text x={316} y={100} style={faint}>No scores yet.</text>

      <text x={16} y={180} style={faint}>
        the list lives in the process, so it ends when the process ends
      </text>

      <defs><Arrow id="m-bad" color="var(--bad)" /></defs>
    </svg>
  );
}

/* ── step 4 · the menu ──────────────────────────────────────────────────── */

function Categories() {
  /* The step is called "What's on the menu", so it is a menu: dishes, a
     dotted leader, and a tick against the three you are ordering. */
  const items = [
    { need: "somewhere to run code", service: "Cloud Run", used: true, icon: "run" },
    { need: "somewhere to keep files", service: "Cloud Storage", used: false, icon: "files" },
    { need: "somewhere to keep records", service: "Firestore", used: true, icon: "records" },
    { need: "something to connect it", service: "networking", used: false, icon: "connect" },
    { need: "something to make it smart", service: "Gemini", used: true, icon: "smart" },
  ];

  const glyph = (kind: string, x: number, y: number, colour: string) => {
    const stroke = { stroke: colour, strokeWidth: 1.6, fill: "none",
                     strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (kind === "run") {
      return (
        <g>
          <rect x={x} y={y} width="20" height="16" rx="3" {...stroke} />
          <path d={`M${x + 5} ${y + 6} l3 2 -3 2`} {...stroke} />
          <path d={`M${x + 11} ${y + 10} h4`} {...stroke} />
        </g>
      );
    }
    if (kind === "files") {
      return (
        <g>
          <rect x={x + 4} y={y} width="16" height="12" rx="2" {...stroke} />
          <rect x={x} y={y + 4} width="16" height="12" rx="2" {...stroke} fill={colour}
                fillOpacity="0.08" />
          <circle cx={x + 5} cy={y + 9} r="1.6" {...stroke} />
          <path d={`M${x + 2} ${y + 15} l4 -4 3 3`} {...stroke} />
        </g>
      );
    }
    if (kind === "records") {
      return (
        <g>
          <rect x={x} y={y} width="20" height="16" rx="2.5" {...stroke} />
          <path d={`M${x} ${y + 5.5} h20 M${x} ${y + 11} h20 M${x + 7} ${y} v16`} {...stroke} />
        </g>
      );
    }
    if (kind === "connect") {
      return (
        <g>
          <circle cx={x + 3} cy={y + 3} r="2.4" {...stroke} />
          <circle cx={x + 17} cy={y + 4} r="2.4" {...stroke} />
          <circle cx={x + 10} cy={y + 14} r="2.4" {...stroke} />
          <path d={`M${x + 5} ${y + 4.5} h9 M${x + 4.5} ${y + 5} l4 7 M${x + 16} ${y + 6} l-4 6`}
                {...stroke} />
        </g>
      );
    }
    return (
      <g>
        <path d={`M${x + 8} ${y} l2.2 5.8 5.8 2.2 -5.8 2.2 -2.2 5.8 -2.2 -5.8 -5.8 -2.2 5.8 -2.2 z`}
              {...stroke} />
        <path d={`M${x + 17} ${y + 11} l1.1 2.9 2.9 1.1 -2.9 1.1 -1.1 2.9 -1.1 -2.9 -2.9 -1.1 2.9 -1.1 z`}
              {...stroke} />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 520 304" role="img"
         aria-label="A menu of the five categories of cloud service, with the three this course uses ticked">
      <rect x="18" y="10" width="484" height="262" rx="14"
            fill="var(--card)" stroke="var(--hairline-strong)" />
      <rect x="28" y="20" width="464" height="242" rx="10"
            fill="none" stroke="var(--hairline)" />

      <text x="260" y="50" textAnchor="middle"
            style={{ fontSize: 11, fill: "var(--fg-faint)", fontFamily: "ui-monospace, monospace",
                     letterSpacing: "0.34em" }}>
        THE MENU
      </text>
      <path d="M210 60 h100" stroke="var(--hairline-strong)" />

      {items.map((item, index) => {
        const y = 84 + index * 38;
        const colour = item.used ? "var(--accent)" : "var(--fg-faint)";
        return (
          <g key={item.need} opacity={item.used ? 1 : 0.5}>
            {glyph(item.icon, 52, y - 12, colour)}

            <text x={90} y={y + 1} style={{ ...strong, fill: "var(--fg)" }}>
              {item.need}
            </text>

            <path d={`M${96 + item.need.length * 6.1} ${y - 3} H 372`}
                  stroke="var(--hairline-strong)" strokeDasharray="1.5 4" />

            <text x={384} y={y + 1} style={{ ...faint, fill: colour, fontWeight: 600 }}>
              {item.service}
            </text>

            {item.used ? (
              <path d={`M462 ${y - 4} l4 5 8 -10`} stroke="var(--ok)" strokeWidth="2"
                    fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <text x={468} y={y + 1} textAnchor="middle"
                    style={{ fontSize: 10, fill: "var(--fg-faint)", fontFamily: "inherit" }}>
                —
              </text>
            )}
          </g>
        );
      })}

      <path d="M52 250 h416" stroke="var(--hairline)" />
      <text x="260" y="294" textAnchor="middle" style={faint}>
        ticked: what DinoQuest orders. the rest are on the menu, just not today.
      </text>
    </svg>
  );
}


function HowMuchMachine() {
  /* Three ways to run the same app. The accent colour is the part that is
     yours to look after; the grey is the part somebody else patches at 3am. */
  const card = (x: number, title: string, subtitle: string) => (
    <g>
      <rect x={x} y={26} width={156} height={172} rx="11"
            fill="var(--card)" stroke="var(--hairline-strong)" />
      <text x={x + 78} y={48} textAnchor="middle" style={strong}>{title}</text>
      <text x={x + 78} y={64} textAnchor="middle" style={faint}>{subtitle}</text>
    </g>
  );

  const yours = { fill: "color-mix(in srgb, var(--accent) 22%, transparent)",
                  stroke: "var(--accent)", strokeWidth: 1.2 };
  const theirs = { fill: "var(--overlay)", stroke: "var(--hairline-strong)",
                   strokeWidth: 1 };

  return (
    <svg viewBox="0 0 520 250" role="img"
         aria-label="A virtual machine, a GKE cluster and a single Cloud Run container, with the parts you look after highlighted">
      {card(8, "Virtual machine", "one computer, yours")}
      {[["your app", 0], ["runtime", 22], ["operating system", 44]].map(([label, dy]) => (
        <g key={label as string}>
          <rect x={28} y={84 + (dy as number)} width={116} height={18} rx="4" {...yours} />
          <text x={86} y={97 + (dy as number)} textAnchor="middle" style={faint}>
            {label as string}
          </text>
        </g>
      ))}
      <rect x={28} y={150} width={116} height={16} rx="4" {...theirs} />
      <text x={86} y={162} textAnchor="middle" style={faint}>the hardware</text>
      <text x={86} y={188} textAnchor="middle" style={{ ...faint, fill: "var(--accent)" }}>
        you patch all of it
      </text>

      {card(182, "GKE", "many machines, yours")}
      <rect x={196} y={80} width={128} height={72} rx="8"
            fill="none" stroke="var(--hairline-strong)" strokeDasharray="4 4" />
      <text x={260} y={94} textAnchor="middle" style={faint}>the cluster</text>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const cx = 214 + (i % 3) * 40;
        const cy = 106 + Math.floor(i / 3) * 28;
        return (
          <g key={i}>
            {i % 3 < 2 && (
              <path d={`M${cx + 22} ${cy + 9} h18`} stroke="var(--hairline-strong)" />
            )}
            {i < 3 && <path d={`M${cx + 11} ${cy + 18} v10`} stroke="var(--hairline-strong)" />}
            <rect x={cx} y={cy} width={22} height={18} rx="3" {...yours} />
          </g>
        );
      })}
      <rect x={196} y={158} width={128} height={14} rx="4" {...theirs} />
      <text x={260} y={169} textAnchor="middle" style={faint}>the hardware</text>
      <text x={260} y={188} textAnchor="middle" style={{ ...faint, fill: "var(--accent)" }}>
        you run the cluster too
      </text>

      {card(356, "Cloud Run", "one container")}
      <rect x={396} y={98} width={76} height={40} rx="6" {...yours} />
      <text x={434} y={122} textAnchor="middle" style={faint}>your container</text>
      <rect x={372} y={148} width={124} height={14} rx="4" {...theirs} />
      <text x={434} y={159} textAnchor="middle" style={faint}>everything else</text>
      <text x={434} y={188} textAnchor="middle" style={{ ...faint, fill: "var(--accent)" }}>
        you patch nothing
      </text>

      <path d="M40 226 H480" stroke="var(--hairline-strong)" />
      <text x={40} y={244} style={faint}>more of it is yours to look after</text>
      <text x={480} y={244} textAnchor="end" style={faint}>less</text>
    </svg>
  );
}


function Architecture() {
  /* What DinoQuest becomes, with the step that adds each piece. The badges
     matter more than the boxes: they turn a diagram into a plan. */
  const badge = (x: number, y: number, label: string) => (
    <g>
      <rect x={x} y={y} width={38} height={15} rx="7.5"
            fill="color-mix(in srgb, var(--accent) 16%, transparent)"
            stroke="var(--accent)" strokeWidth="0.8" />
      <text x={x + 19} y={y + 11} textAnchor="middle"
            style={{ fontSize: 9, fill: "var(--accent)", fontWeight: 600,
                     fontFamily: "inherit" }}>
        {label}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 520 330" role="img"
         aria-label="The finished DinoQuest: a browser talking to Cloud Run, which talks to Firestore and Gemini, with Cloud Build and Artifact Registry putting the code there">
      {/* the project everything sits in */}
      <rect x={120} y={18} width={386} height={190} rx="12"
            fill="none" stroke="var(--violet)" strokeWidth="1.2" strokeDasharray="7 5" />
      <text x={134} y={36} style={{ ...faint, fill: "var(--violet)" }}>
        your project · one bill, one set of permissions
      </text>

      <Box x={12} y={92} w={92} h={44} title="a player" note="any browser" />

      {/* the app */}
      <rect x={150} y={80} width={116} height={62} rx="9"
            fill="color-mix(in srgb, var(--accent) 12%, transparent)"
            stroke="var(--accent)" strokeWidth="1.4" />
      <text x={208} y={104} textAnchor="middle" style={strong}>Cloud Run</text>
      <text x={208} y={122} textAnchor="middle" style={faint}>the game</text>
      {badge(189, 50, "step 7")}

      <path d="M106 108 h40" stroke="var(--accent)" strokeWidth="2"
            markerEnd="url(#a4)" />
      <text x={104} y={100} style={faint}>https</text>

      {/* what it talks to */}
      <Box x={330} y={62} w={112} h={44} title="Firestore" note="the leaderboard" />
      {badge(367, 40, "step 5")}
      <path d="M268 100 h58" stroke="var(--fg-faint)" strokeWidth="1.4"
            markerEnd="url(#a4g)" />

      <Box x={330} y={136} w={112} h={44} title="Gemini" note="draws the dino" />
      {badge(367, 188, "step 6")}
      <path d="M268 126 h58" stroke="var(--fg-faint)" strokeWidth="1.4"
            markerEnd="url(#a4g)" />

      {/* how the code gets there */}
      <text x={12} y={258} style={{ ...faint, fill: "var(--fg-faint)" }}>
        how your code gets in
      </text>
      <Box x={12} y={266} w={88} h={38} title="app/" note="your code" />
      <Box x={124} y={266} w={98} h={38} title="Cloud Build" note="makes a container" />
      <Box x={246} y={266} w={112} h={38} title="Artifact Registry" note="keeps it" />
      <path d="M102 285 h18" stroke="var(--hairline-strong)" markerEnd="url(#a4g)" />
      <path d="M224 285 h18" stroke="var(--hairline-strong)" markerEnd="url(#a4g)" />
      <path d="M302 264 v-50" stroke="var(--hairline-strong)" fill="none"
            markerEnd="url(#a4g)" />
      <text x={314} y={252} style={faint}>deployed into the project</text>

      <defs>
        <Arrow id="a4" color="var(--accent)" />
        <Arrow id="a4g" color="var(--fg-faint)" />
      </defs>
    </svg>
  );
}


/* ── step 5 · databases ─────────────────────────────────────────────────── */

function cylinder(cx: number, top: number, w: number, h: number, colour: string) {
  const rx = w / 2;
  const ry = Math.max(6, w / 7);
  return (
    <g>
      <path d={`M${cx - rx} ${top} v${h} a${rx} ${ry} 0 0 0 ${w} 0 v-${h}`}
            fill="color-mix(in srgb, var(--accent) 10%, transparent)" stroke={colour}
            strokeWidth="1.4" />
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill="var(--card)" stroke={colour}
               strokeWidth="1.4" />
    </g>
  );
}

function ProcessBoundary() {
  return (
    <svg viewBox="0 0 520 230" role="img"
         aria-label="A dashed boundary around the running process: the list is inside it, the database is outside">
      <rect x={20} y={26} width={244} height={124} rx="12" fill="none"
            stroke="var(--red)" strokeWidth="1.4" strokeDasharray="7 5" />
      <text x={34} y={18} style={{ ...faint, fill: "var(--red)" }}>the running process</text>

      <Box x={44} y={50} w={96} h={40} title="DinoQuest" note="the game" />
      <rect x={160} y={50} width={84} height={40} rx="8"
            fill="color-mix(in srgb, var(--red) 10%, transparent)" stroke="var(--red)" />
      <text x={202} y={68} textAnchor="middle" style={mono}>SCORES</text>
      <text x={202} y={82} textAnchor="middle" style={faint}>a list</text>

      <text x={44} y={122} style={faint}>everything in here ends</text>
      <text x={44} y={136} style={faint}>when the process ends</text>

      {cylinder(388, 52, 104, 62, "var(--accent)")}
      <text x={388} y={92} textAnchor="middle" style={strong}>the database</text>
      <text x={388} y={140} textAnchor="middle" style={{ ...faint, fill: "var(--accent)" }}>
        its own process, its own disk
      </text>

      <path d="M140 70 h14" stroke="var(--hairline-strong)" markerEnd="url(#db-g)" />
      <path d="M266 70 h64" stroke="var(--accent)" strokeWidth="1.6" markerEnd="url(#db-a)" />
      <text x={272} y={62} style={faint}>writes</text>

      <path d="M20 186 H500" stroke="var(--hairline)" />
      <text x={20} y={178} style={{ ...faint, fill: "var(--red)" }}>
        restart: the list is empty again
      </text>
      <text x={500} y={178} textAnchor="end" style={{ ...faint, fill: "var(--accent)" }}>
        restart: the database has not moved
      </text>
      <text x={20} y={210} style={faint}>
        a database is simply a place that is not inside your program
      </text>

      <defs>
        <Arrow id="db-g" color="var(--hairline-strong)" />
        <Arrow id="db-a" color="var(--accent)" />
      </defs>
    </svg>
  );
}

function DatabaseOptions() {
  /* Not a feature comparison. Each row draws the shape of the data the thing
     is built for, because that is what actually decides which one you want. */
  const cell = { fontSize: 8.5, fill: "var(--fg-muted)",
                 fontFamily: "ui-monospace, monospace" } as const;
  const rowY = (i: number) => 44 + i * 46;

  const frame = (i: number, mine = false) => (
    <rect x={150} y={rowY(i) - 17} width={286} height={34} rx="6"
          fill={mine ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--card)"}
          stroke={mine ? "var(--accent)" : "var(--hairline-strong)"} />
  );

  const names = [
    ["Firestore", "one document", true],
    ["Cloud SQL", "rows, and joins", false],
    ["Spanner", "the same, everywhere", false],
    ["Bigtable", "one key, endless cells", false],
    ["BigQuery", "everything that happened", false],
  ] as const;

  return (
    <svg viewBox="0 0 520 268" role="img"
         aria-label="Five Google Cloud databases, each showing the shape of data it is built for">
      <text x={20} y={20} style={faint}>what the data looks like</text>

      {names.map(([name, note, mine], i) => (
        <g key={name}>
          <text x={20} y={rowY(i) - 2} style={{ ...strong, fill: mine ? "var(--accent)" : "var(--fg)" }}>
            {name}
          </text>
          <text x={20} y={rowY(i) + 11} style={faint}>{note}</text>
          {frame(i, mine)}
        </g>
      ))}

      {/* Firestore: a document */}
      <text x={162} y={rowY(0) + 3} style={cell}>
        {'{ "name": "rex", "score": 310 }'}
      </text>

      {/* Cloud SQL: a table with a join */}
      {["id", "player", "score"].map((head, c) => (
        <text key={head} x={166 + c * 62} y={rowY(1) - 9} style={{ ...cell, fill: "var(--fg-faint)" }}>
          {head}
        </text>
      ))}
      {[["7", "rex", "310"], ["8", "ada", "255"]].map((row, r) =>
        row.map((value, c) => (
          <text key={`${r}-${c}`} x={166 + c * 62} y={rowY(1) + 3 + r * 11} style={cell}>
            {value}
          </text>
        )),
      )}
      <path d={`M340 ${rowY(1) - 13} h28`} stroke="var(--hairline-strong)" />
      <text x={372} y={rowY(1) - 9} style={{ ...cell, fill: "var(--fg-faint)" }}>joined to</text>
      <text x={372} y={rowY(1) + 6} style={cell}>players</text>

      {/* Spanner: the same rows, in three places at once */}
      {[2, 1, 0].map((copy) => (
        <rect key={copy} x={164 + copy * 7} y={rowY(2) - 12 - copy * 4} width={78} height={22}
              rx="3" fill="var(--card)" stroke="var(--hairline-strong)"
              opacity={copy === 0 ? 1 : 0.45} />
      ))}
      <text x={174} y={rowY(2) + 3} style={cell}>rex 310</text>
      {["us", "eu", "asia"].map((where, i) => (
        <g key={where}>
          <circle cx={288 + i * 48} cy={rowY(2) - 2} r="4" fill="var(--hairline-strong)" />
          <text x={288 + i * 48} y={rowY(2) + 14} textAnchor="middle"
                style={{ ...cell, fill: "var(--fg-faint)" }}>{where}</text>
        </g>
      ))}

      {/* Bigtable: one key, a very wide row */}
      <text x={162} y={rowY(3) + 3} style={cell}>dino#42</text>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={214 + i * 13} y={rowY(3) - 9} width={9} height={18} rx="1.5"
              fill="var(--hairline-strong)" opacity={0.25 + (i % 4) * 0.18} />
      ))}
      <text x={424} y={rowY(3) + 3} style={{ ...cell, fill: "var(--fg-faint)" }}>…</text>

      {/* BigQuery: a great many rows, one answer */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={162} y={rowY(4) - 12 + i * 3.4} width={116} height={1.7}
              fill="var(--hairline-strong)" opacity="0.55" />
      ))}
      <path d={`M292 ${rowY(4)} h24`} stroke="var(--hairline-strong)" markerEnd="url(#dbq)" />
      <text x={330} y={rowY(4) + 4} style={{ ...cell, fill: "var(--fg)" }}>
        avg score = 218
      </text>

      <text x={20} y={258} style={faint}>
        the shape of your data decides this, not the size of your ambition
      </text>

      <defs><Arrow id="dbq" color="var(--hairline-strong)" /></defs>
    </svg>
  );
}


function NothingToProvision() {
  const knobs = ["machine size", "disk size", "a password", "backups", "patching", "an upgrade window"];

  return (
    <svg viewBox="0 0 520 220" role="img"
         aria-label="Cloud SQL asks you for six decisions; Firestore asks for one">
      <rect x={16} y={24} width={230} height={168} rx="11" fill="var(--card)"
            stroke="var(--hairline-strong)" />
      <text x={131} y={46} textAnchor="middle" style={strong}>Cloud SQL</text>
      <text x={131} y={62} textAnchor="middle" style={faint}>an instance, yours</text>
      {knobs.map((knob, index) => (
        <g key={knob}>
          <rect x={36} y={74 + index * 19} width={190} height={15} rx="4"
                fill="var(--overlay)" stroke="var(--hairline)" />
          <text x={44} y={85 + index * 19} style={faint}>{knob}</text>
        </g>
      ))}

      <rect x={274} y={24} width={230} height={168} rx="11"
            fill="color-mix(in srgb, var(--accent) 8%, transparent)" stroke="var(--accent)" />
      <text x={389} y={46} textAnchor="middle" style={strong}>Firestore</text>
      <text x={389} y={62} textAnchor="middle" style={faint}>a service, theirs</text>
      <rect x={294} y={74} width={190} height={15} rx="4"
            fill="color-mix(in srgb, var(--accent) 16%, transparent)" stroke="var(--accent)" />
      <text x={302} y={85} style={{ ...faint, fill: "var(--accent)" }}>a region</text>
      <text x={389} y={126} textAnchor="middle" style={faint}>that is the whole decision</text>
      <text x={389} y={150} textAnchor="middle" style={faint}>nobody playing costs nothing</text>
      <text x={389} y={170} textAnchor="middle" style={faint}>nothing left running to forget</text>

      <text x={16} y={212} style={faint}>
        both keep records safely; only one hands you a machine to look after
      </text>
    </svg>
  );
}

function TwoChanges() {
  return (
    <svg viewBox="0 0 520 190" role="img"
         aria-label="Two changes: a database is created, and one section of one file is rewritten">
      <circle cx={36} cy={44} r="11" fill="color-mix(in srgb, var(--accent) 18%, transparent)"
              stroke="var(--accent)" />
      <text x={36} y={48} textAnchor="middle" style={{ ...faint, fill: "var(--accent)" }}>1</text>
      <text x={58} y={40} style={strong}>a database has to exist</text>
      <text x={58} y={56} style={faint}>created once, in a region, outside your app</text>
      {cylinder(430, 24, 62, 34, "var(--accent)")}

      <circle cx={36} cy={116} r="11" fill="color-mix(in srgb, var(--accent) 18%, transparent)"
              stroke="var(--accent)" />
      <text x={36} y={120} textAnchor="middle" style={{ ...faint, fill: "var(--accent)" }}>2</text>
      <text x={58} y={112} style={strong}>one section of one file changes</text>
      <text x={58} y={128} style={faint}>the game, the page and the API calls are untouched</text>

      <rect x={352} y={86} width={152} height={72} rx="7" fill="var(--card)"
            stroke="var(--hairline-strong)" />
      <text x={362} y={100} style={mono}>main.py</text>
      {[0, 1, 2, 3].map((row) => (
        <rect key={row} x={362} y={106 + row * 12} width={race(row)} height={5} rx="2.5"
              fill={row === 1 ? "var(--accent)" : "var(--hairline-strong)"}
              opacity={row === 1 ? 1 : 0.45} />
      ))}
      <text x={430} y={172} textAnchor="middle" style={{ ...faint, fill: "var(--accent)" }}>
        only the coloured part
      </text>
    </svg>
  );
}

function race(row: number): number {
  return [120, 132, 96, 110][row];
}


/* ── step 1 ─────────────────────────────────────────────────────────────── */

function RentVsOwn() {
  const hours = [12, 14, 18, 30, 62, 88, 74, 40, 26, 18, 14, 12];
  const peak = 96;
  const width = 26;

  return (
    <svg viewBox="0 0 520 220" role="img"
         aria-label="Demand rising and falling through a day against a flat line of owned capacity">
      <line x1="46" y1="176" x2="500" y2="176" stroke="var(--hairline-strong)" />
      <line x1="46" y1="52" x2="500" y2="52" stroke="var(--bad)" strokeWidth="2"
            strokeDasharray="6 5" />
      <text x="46" y="42" style={{ ...faint, fill: "var(--bad)" }}>
        capacity you bought, all day and all night
      </text>

      {hours.map((value, index) => {
        const height = (value / peak) * 124;
        return (
          <rect key={index} x={52 + index * (width + 11)} y={176 - height}
                width={width} height={height} rx="3" fill="var(--accent)" opacity="0.85" />
        );
      })}

      <text x="52" y="196" style={faint}>3 AM</text>
      <text x="248" y="196" style={faint}>midday</text>
      <text x="452" y="196" style={faint}>3 AM</text>
      <text x="46" y="212" style={faint}>
        the space between the line and the bars is capacity you paid for and did not use
      </text>
    </svg>
  );
}

function ThreeTraits() {
  const traits = [
    ["on demand", "seconds, not weeks", "nobody approves you"],
    ["pay per use", "by the second", "delete it, stop paying"],
    ["operated", "power, disks, patches", "not your problem"],
  ];
  return (
    <svg viewBox="0 0 520 168" role="img" aria-label="The three characteristics of a cloud service">
      {traits.map(([title, a, b], index) => (
        <g key={title}>
          <rect x={16 + index * 166} y="24" width="152" height="112" rx="10"
                fill="var(--card)" stroke="var(--hairline-strong)" />
          <text x={34 + index * 166} y="56" style={strong}>{title}</text>
          <text x={34 + index * 166} y="82" style={label}>{a}</text>
          <text x={34 + index * 166} y="104" style={faint}>{b}</text>
        </g>
      ))}
      <text x="16" y="158" style={faint}>
        a service is a cloud service when it has all three
      </text>
    </svg>
  );
}

function RentThree() {
  const rented = [
    ["Compute", "Cloud Run"],
    ["Database storage", "Firestore"],
    ["Foundation model", "Gemini"],
  ];
  return (
    <svg viewBox="0 0 520 130" role="img"
         aria-label="Three layers consumed on demand across the course: compute, database storage, and a foundation model">
      <text x="16" y="26" style={faint}>rent</text>
      {rented.map(([what, when], index) => (
        <g key={what}>
          <rect x={16 + index * 168} y="38" width="152" height="54" rx="9"
                fill="color-mix(in srgb, var(--accent) 10%, transparent)"
                stroke="var(--accent)" />
          <text x={92 + index * 168} y="62" textAnchor="middle" style={strong}>{what}</text>
          <text x={92 + index * 168} y="80" textAnchor="middle" style={faint}>{when}</text>
        </g>
      ))}
      <text x="16" y="116" style={faint}>
        One consumption model across compute, storage, and AI: provision on demand rather than owning hardware
      </text>
    </svg>
  );
}

/* ── step 2 ─────────────────────────────────────────────────────────────── */

function ProjectBox() {
  /* Five boundaries, drawn as five things the box actually does to whatever is
     inside it, rather than a list of nouns. */
  const inside = [
    { name: "Cloud Run", x: 150, y: 104 },
    { name: "database", x: 246, y: 104 },
    { name: "bucket", x: 342, y: 104 },
  ];

  return (
    <svg viewBox="0 0 520 300" role="img"
         aria-label="A project as a box: costs report out of it, access applies inside it, services switch on inside it, quota is counted inside it, and deleting it deletes everything">
      <rect x={118} y={62} width={286} height={104} rx="12"
            fill="color-mix(in srgb, var(--accent) 8%, transparent)"
            stroke="var(--accent)" strokeWidth="1.5" />
      <text x={261} y={84} textAnchor="middle" style={strong}>your project</text>

      {inside.map((thing) => (
        <g key={thing.name}>
          <rect x={thing.x - 42} y={thing.y - 6} width={84} height={34} rx="7"
                fill="var(--card)" stroke="var(--hairline-strong)" />
          <text x={thing.x} y={thing.y + 16} textAnchor="middle" style={faint}>
            {thing.name}
          </text>
        </g>
      ))}

      {/* 1 · money reports out */}
      <path d="M404 92 H468" stroke="var(--amber)" strokeWidth="1.5"
            markerEnd="url(#p-amber)" />
      <text x={412} y={84} style={{ ...faint, fill: "var(--amber)" }}>every cost</text>
      <rect x={430} y={100} width={74} height={30} rx="7"
            fill="var(--card)" stroke="var(--amber)" />
      <text x={467} y={119} textAnchor="middle" style={strong}>the bill</text>

      {/* 2 · access applies to everything inside */}
      <path d="M116 92 H52" stroke="var(--violet)" strokeWidth="1.5"
            markerEnd="url(#p-violet)" />
      <rect x={16} y={100} width={84} height={30} rx="7"
            fill="var(--card)" stroke="var(--violet)" />
      <text x={58} y={119} textAnchor="middle" style={strong}>a person</text>
      <text x={16} y={84} style={{ ...faint, fill: "var(--violet)" }}>access here</text>
      <text x={16} y={148} style={faint}>reaches all three</text>

      {/* 3 · services are off until switched on */}
      <g>
        <text x={118} y={196} style={strong}>switches</text>
        <text x={118} y={212} style={faint}>every service is off</text>
        <text x={118} y={226} style={faint}>until you turn it on here</text>
        {[0, 1, 2].map((index) => (
          <g key={index}>
            <rect x={232 + index * 30} y={186} width={22} height={12} rx="6"
                  fill={index === 0 ? "var(--ok)" : "var(--hairline-strong)"} />
            <circle cx={index === 0 ? 248 + index * 30 : 238 + index * 30} cy={192} r="4.5"
                    fill="var(--card)" />
          </g>
        ))}
      </g>

      {/* 4 · quota is counted here */}
      <text x={330} y={196} style={strong}>quota</text>
      <text x={330} y={212} style={faint}>how much you may</text>
      <text x={330} y={226} style={faint}>create, counted here</text>

      {/* 5 · deleting the box deletes the contents */}
      <rect x={118} y={244} width={286} height={40} rx="9"
            fill="none" stroke="var(--red)" strokeDasharray="6 4" />
      <text x={261} y={262} textAnchor="middle"
            style={{ ...strong, fill: "var(--red)" }}>delete the project</text>
      <text x={261} y={277} textAnchor="middle" style={faint}>
        and all three go with it, and so does the bill
      </text>

      <defs>
        <Arrow id="p-amber" color="var(--amber)" />
        <Arrow id="p-violet" color="var(--violet)" />
      </defs>
    </svg>
  );
}


function ThreeNames() {
  const names = [
    ["project name", "My First App", "change it any time"],
    ["project ID", "my-first-app-4821", "permanent, globally unique"],
    ["project number", "529384710255", "assigned for you"],
  ];
  return (
    <svg viewBox="0 0 520 178" role="img"
         aria-label="Project name, ID, and number compared">
      {names.map(([title, example, note], index) => {
        const accent = index === 1;
        return (
          <g key={title}>
            <rect x="16" y={22 + index * 50} width="488" height="42" rx="8"
                  fill={accent ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--card)"}
                  stroke={accent ? "var(--accent)" : "var(--hairline-strong)"} />
            <text x="34" y={48 + index * 50} style={strong}>{title}</text>
            <text x="164" y={48 + index * 50} style={mono}>{example}</text>
            <text x="330" y={48 + index * 50} style={faint}>{note}</text>
          </g>
        );
      })}
      <text x="16" y="172" style={faint}>the middle one is the one every command means</text>
    </svg>
  );
}

function BillingLink() {
  return (
    <svg viewBox="0 0 520 176" role="img"
         aria-label="One billing account linked to several projects">
      <rect x="180" y="22" width="160" height="48" rx="9"
            fill="color-mix(in srgb, var(--accent) 12%, transparent)" stroke="var(--accent)" />
      <text x="260" y="44" textAnchor="middle" style={strong}>billing account</text>
      <text x="260" y="60" textAnchor="middle" style={faint}>its own resource</text>

      {["dev", "staging", "prod"].map((name, index) => (
        <g key={name}>
          <path d={`M260 72 C 260 100, ${96 + index * 164} 100, ${96 + index * 164} 118`}
                stroke="var(--hairline-strong)" fill="none" />
          <rect x={40 + index * 164} y="118" width="112" height="42" rx="8"
                fill="var(--card)" stroke="var(--hairline-strong)" />
          <text x={96 + index * 164} y="144" textAnchor="middle" style={strong}>{name}</text>
        </g>
      ))}
      <text x="16" y="172" style={faint}>one account can pay for many projects</text>
    </svg>
  );
}

function BudgetAlert() {
  return (
    <svg viewBox="0 0 520 156" role="img"
         aria-label="A budget alert notifies you but does not stop spending">
      <line x1="40" y1="128" x2="496" y2="128" stroke="var(--hairline-strong)" />
      <text x="40" y="146" style={faint}>spending, over the month</text>

      <line x1="40" y1="62" x2="496" y2="62" stroke="var(--amber)"
            strokeWidth="1.5" strokeDasharray="6 4" />
      <text x="40" y="52" style={{ ...faint, fill: "var(--amber)" }}>your threshold</text>

      <path d="M40 126 C 150 122, 230 100, 300 62 S 430 26, 492 18"
            stroke="var(--accent)" strokeWidth="2" fill="none" />

      <circle cx="300" cy="62" r="5" fill="var(--amber)" />
      <path d="M306 68 l14 16" stroke="var(--hairline-strong)" />
      <text x="324" y="92" style={strong}>email arrives</text>
      <text x="324" y="108" style={faint}>and spending carries on</text>
    </svg>
  );
}


function ApiSwitches() {
  const apis = ["run", "firestore", "artifactregistry", "aiplatform"];
  return (
    <svg viewBox="0 0 520 156" role="img" aria-label="Services are switched off until enabled">
      <text x="16" y="26" style={faint}>every service, in every new project</text>
      {apis.map((name, index) => {
        const on = index === 0;
        return (
          <g key={name}>
            <rect x="16" y={40 + index * 28} width="330" height="22" rx="6"
                  fill="var(--card)" stroke="var(--hairline)" />
            <text x="30" y={55 + index * 28} style={mono}>{name}.googleapis.com</text>
            <rect x={360} y={42 + index * 28} width="34" height="18" rx="9"
                  fill={on ? "var(--ok)" : "var(--hairline-strong)"} />
            <circle cx={on ? 385 : 369} cy={51 + index * 28} r="7" fill="var(--card)" />
            <text x={404} y={56 + index * 28} style={faint}>{on ? "enabled" : "off"}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ErrorAnatomy() {
  return (
    <svg viewBox="0 0 520 170" role="img" aria-label="The three useful facts inside a permission error">
      <rect x="16" y="22" width="488" height="58" rx="8"
            fill="var(--code-bg)" stroke="var(--hairline-strong)" />
      <text x="32" y="46" style={{ ...mono, fill: "var(--code-fg)" }}>
        PERMISSION_DENIED: Cloud Run Admin API has not been
      </text>
      <text x="32" y="64" style={{ ...mono, fill: "var(--code-fg)" }}>
        used in project 4821 before or it is disabled.
      </text>

      {[["what is wrong", 60], ["which service", 214], ["which project", 380]].map(
        ([text, x], index) => (
          <g key={text as string}>
            <path d={`M${x as number} 84 v18`} stroke="var(--accent)" />
            <text x={x as number} y={118} textAnchor="middle" style={strong}>
              {text as string}
            </text>
          </g>
        ),
      )}
      <text x="16" y="158" style={faint}>
        read the error. it names the fix more often than not
      </text>
    </svg>
  );
}


/* ── step 6 ─────────────────────────────────────────────────────────────── */

function RentIntelligence() {
  const items = [
    { title: "A machine", note: "step 1", on: false },
    { title: "A database", note: "step 5", on: false },
    { title: "A model", note: "this step", on: true },
  ];

  return (
    <svg viewBox="0 0 520 168" role="img"
         aria-label="Renting compute, then storage, then a model">
      <defs><Arrow id="rent-i-arrow" color="var(--hairline-strong)" /></defs>

      {items.map((item, index) => {
        const x = 24 + index * 168;
        return (
          <g key={item.title}>
            <Box x={x} y={44} w={140} h={56} title={item.title} note={item.note}
                 accent={item.on} />
            {index < 2 && (
              <line x1={x + 146} y1={72} x2={x + 164} y2={72}
                    stroke="var(--hairline-strong)" markerEnd="url(#rent-i-arrow)" />
            )}
          </g>
        );
      })}

      <text x="260" y="26" textAnchor="middle" style={label}>
        The same arrangement, three times
      </text>
      <text x="260" y="150" textAnchor="middle" style={faint}>
        no hardware, no capacity planning, charged for what you use
      </text>
    </svg>
  );
}

function OwnAModel() {
  return (
    <svg viewBox="0 0 520 196" role="img"
         aria-label="What training a model yourself would take, next to one API call">
      <rect x="20" y="34" width="236" height="132" rx="10" fill="none"
            stroke="var(--hairline-strong)" strokeDasharray="4 4" />
      <text x="138" y="24" textAnchor="middle" style={label}>Train your own</text>

      {[
        "thousands of accelerators",
        "a dataset nobody has",
        "weeks of training runs",
        "a team who has done it before",
      ].map((line, index) => (
        <g key={line}>
          <circle cx="42" cy={62 + index * 26} r="2.5" fill="var(--fg-faint)" />
          <text x="54" y={66 + index * 26} style={faint}>{line}</text>
        </g>
      ))}

      <rect x="284" y="34" width="216" height="132" rx="10"
            fill="color-mix(in srgb, var(--accent) 10%, transparent)"
            stroke="var(--accent)" />
      <text x="392" y="24" textAnchor="middle" style={label}>Call one instead</text>

      <rect x="300" y="78" width="184" height="44" rx="7" fill="var(--code-bg)"
            stroke="var(--hairline)" />
      <text x="392" y="105" textAnchor="middle"
            style={{ ...mono, fill: "var(--code-fg)" }}>
        generate_content(…)
      </text>
      <text x="392" y="144" textAnchor="middle" style={faint}>
        one call, billed per token
      </text>
    </svg>
  );
}

function ModelModalities() {
  const goesIn = ["text", "images", "audio", "video", "PDFs"];
  const comesOut = ["text", "images", "audio", "video"];

  return (
    <svg viewBox="0 0 520 198" role="img"
         aria-label="What a hosted model accepts and what it returns">
      <defs><Arrow id="mm-arrow" color="var(--accent)" /></defs>

      <text x="82" y="26" textAnchor="middle" style={label}>Goes in</text>
      {goesIn.map((item, index) => (
        <g key={item}>
          <rect x="30" y={38 + index * 26} width="104" height="20" rx="5"
                fill="var(--card)" stroke="var(--hairline-strong)" />
          <text x="82" y={52 + index * 26} textAnchor="middle"
                style={{ ...faint, fontSize: 10 }}>
            {item}
          </text>
        </g>
      ))}

      <line x1="144" y1="98" x2="188" y2="98" stroke="var(--accent)"
            markerEnd="url(#mm-arrow)" />

      <rect x="196" y="62" width="128" height="72" rx="10"
            fill="color-mix(in srgb, var(--accent) 14%, transparent)"
            stroke="var(--accent)" />
      <text x="260" y="94" textAnchor="middle" style={strong}>a model</text>
      <text x="260" y="112" textAnchor="middle" style={faint}>running on</text>
      <text x="260" y="126" textAnchor="middle" style={faint}>Google's hardware</text>

      <line x1="332" y1="98" x2="376" y2="98" stroke="var(--accent)"
            markerEnd="url(#mm-arrow)" />

      <text x="438" y="26" textAnchor="middle" style={label}>Comes back</text>
      {comesOut.map((item, index) => (
        <g key={item}>
          <rect x="386" y={38 + index * 26} width="104" height="20" rx="5"
                fill="var(--card)" stroke="var(--hairline-strong)" />
          <text x="438" y={52 + index * 26} textAnchor="middle"
                style={{ ...faint, fontSize: 10 }}>
            {item}
          </text>
        </g>
      ))}

      <text x="260" y="188" textAnchor="middle" style={faint}>
        Which of these a given model handles is on its model card.
      </text>
    </svg>
  );
}

function ModelCycle() {
  const stations = [
    { x: 18, y: 44, title: "Find one", feature: ["Model Garden"] },
    { x: 190, y: 44, title: "Try a prompt", feature: ["Agent Studio"] },
    { x: 362, y: 44, title: "Call it", feature: ["Gemini API", "Gen AI SDK"] },
    { x: 362, y: 176, title: "Improve it", feature: ["Grounding, RAG Engine", "Tuning"] },
    { x: 190, y: 176, title: "Check it", feature: ["Gen AI evaluation", "service"] },
    { x: 18, y: 176, title: "Serve and watch", feature: ["Inference", "Model Monitoring"] },
  ];

  return (
    <svg viewBox="0 0 520 292" role="img"
         aria-label="The stages of working with a model, and the platform feature for each">
      <defs><Arrow id="cycle-arrow" color="var(--accent)" /></defs>

      {stations.map((station, index) => (
        <g key={station.title}>
          <rect x={station.x} y={station.y} width="140" height="72" rx="9"
                fill={index === 2
                  ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                  : "var(--card)"}
                stroke={index === 2 ? "var(--accent)" : "var(--hairline-strong)"} />
          <text x={station.x + 70} y={station.y + 26} textAnchor="middle" style={strong}>
            {station.title}
          </text>
          {station.feature.map((line, row) => (
            <text key={line} x={station.x + 70} y={station.y + 44 + row * 13}
                  textAnchor="middle" style={{ ...mono, fontSize: 9 }}>
              {line}
            </text>
          ))}
        </g>
      ))}

      {/* across the top row, down the right, back across the bottom, up the left */}
      <line x1="160" y1="80" x2="184" y2="80" stroke="var(--accent)"
            markerEnd="url(#cycle-arrow)" />
      <line x1="332" y1="80" x2="356" y2="80" stroke="var(--accent)"
            markerEnd="url(#cycle-arrow)" />
      <line x1="432" y1="118" x2="432" y2="170" stroke="var(--accent)"
            markerEnd="url(#cycle-arrow)" />
      <line x1="356" y1="212" x2="332" y2="212" stroke="var(--accent)"
            markerEnd="url(#cycle-arrow)" />
      <line x1="184" y1="212" x2="160" y2="212" stroke="var(--accent)"
            markerEnd="url(#cycle-arrow)" />
      <line x1="88" y1="170" x2="88" y2="122" stroke="var(--accent)"
            strokeDasharray="4 4" markerEnd="url(#cycle-arrow)" />

      <text x="260" y="26" textAnchor="middle" style={label}>
        One request is the small part. This is the rest of it.
      </text>
      <text x="260" y="286" textAnchor="middle" style={faint}>
        This course does the top row. The bottom row is what turns a demo into a service.
      </text>
    </svg>
  );
}

function AgentPillars() {
  const pillars = [
    { title: "Build", note: "write the agent",
      items: ["ADK", "Agent Studio", "Agent Garden"] },
    { title: "Scale", note: "run it",
      items: ["Agent Runtime", "Sessions", "Memory Bank"] },
    { title: "Govern", note: "keep it in bounds",
      items: ["Agent Registry", "Agent Identity", "Agent Gateway", "Model Armor"] },
    { title: "Optimize", note: "find out if it works",
      items: ["Agent evaluation", "Agent Observability"] },
  ];

  return (
    <svg viewBox="0 0 520 224" role="img"
         aria-label="Four pillars of the agent platform and the features under each">
      <text x="260" y="22" textAnchor="middle" style={label}>
        What the platform gives an agent that a single model call does not need
      </text>

      {pillars.map((pillar, index) => {
        const x = 12 + index * 128;
        return (
          <g key={pillar.title}>
            <rect x={x} y={36} width="116" height="176" rx="9"
                  fill={index === 0
                    ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                    : "var(--card)"}
                  stroke={index === 0 ? "var(--accent)" : "var(--hairline-strong)"} />
            <text x={x + 58} y={60} textAnchor="middle" style={strong}>{pillar.title}</text>
            <text x={x + 58} y={76} textAnchor="middle" style={faint}>{pillar.note}</text>
            <line x1={x + 16} y1={86} x2={x + 100} y2={86} stroke="var(--hairline)" />

            {pillar.items.map((item, row) => (
              <text key={item} x={x + 58} y={106 + row * 22} textAnchor="middle"
                    style={{ ...mono, fontSize: 8.5 }}>
                {item}
              </text>
            ))}
          </g>
        );
      })}

    </svg>
  );
}

function ModelGarden() {
  const shelves = [
    {
      title: "Google models",
      note: "Gemini, Imagen, Veo, Lyria",
      cards: ["text", "image", "video", "audio"],
      accent: true,
    },
    {
      title: "Open models",
      note: "Gemma and others, weights you can take",
      cards: ["open", "tune", "host"],
      accent: false,
    },
    {
      title: "Partner models",
      note: "third parties, same account, same bill",
      cards: ["partner", "partner"],
      accent: false,
    },
  ];

  return (
    <svg viewBox="0 0 520 272" role="img"
         aria-label="Model Garden: Google models, open models and partner models on one shelf">
      <text x="260" y="22" textAnchor="middle" style={label}>
        Model Garden — one catalogue, more than 200 models
      </text>

      {shelves.map((shelf, row) => {
        const y = 40 + row * 70;
        const colour = shelf.accent ? "var(--accent)" : "var(--hairline-strong)";
        return (
          <g key={shelf.title}>
            <text x="24" y={y + 20} style={strong}>{shelf.title}</text>
            <text x="24" y={y + 36} style={faint}>{shelf.note}</text>

            {shelf.cards.map((card, index) => (
              <g key={card + index}>
                <rect x={286 + index * 56} y={y} width={48} height={44} rx="6"
                      fill={shelf.accent
                        ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                        : "var(--card)"}
                      stroke={colour} />
                <text x={310 + index * 56} y={y + 27} textAnchor="middle"
                      style={{ ...faint, fontSize: 9 }}>
                  {card}
                </text>
              </g>
            ))}

            <line x1="24" y1={y + 52} x2="496" y2={y + 52} stroke="var(--hairline)" />
          </g>
        );
      })}

      <text x="260" y="262" textAnchor="middle" style={faint}>
        Pick one, read what it costs, call it. Nothing is downloaded or installed.
      </text>
    </svg>
  );
}

function GlobalEndpoint() {
  const regions = [0, 1, 2, 3, 4];

  return (
    <svg viewBox="0 0 520 210" role="img"
         aria-label="A regional endpoint compared with the global endpoint">
      <defs>
        <Arrow id="ge-one" color="var(--hairline-strong)" />
        <Arrow id="ge-many" color="var(--accent)" />
      </defs>

      {/* regional */}
      <text x="130" y="22" textAnchor="middle" style={label}>A region you name</text>
      <rect x="86" y="34" width="88" height="34" rx="6" fill="var(--card)"
            stroke="var(--hairline-strong)" />
      <text x="130" y="55" textAnchor="middle" style={mono}>your app</text>
      <line x1="130" y1="72" x2="130" y2="104" stroke="var(--hairline-strong)"
            markerEnd="url(#ge-one)" />
      <rect x="86" y="110" width="88" height="34" rx="6" fill="var(--card)"
            stroke="var(--hairline-strong)" />
      <text x="130" y="131" textAnchor="middle" style={{ ...mono, fontSize: 9 }}>
        us-central1
      </text>
      <text x="130" y="166" textAnchor="middle" style={faint}>served there,</text>
      <text x="130" y="181" textAnchor="middle" style={faint}>or not at all</text>

      <line x1="260" y1="30" x2="260" y2="180" stroke="var(--hairline)" strokeDasharray="3 4" />

      {/* global */}
      <text x="390" y="22" textAnchor="middle" style={label}>The global endpoint</text>
      <rect x="346" y="34" width="88" height="34" rx="6"
            fill="color-mix(in srgb, var(--accent) 14%, transparent)"
            stroke="var(--accent)" />
      <text x="390" y="55" textAnchor="middle" style={mono}>your app</text>

      {regions.map((index) => (
        <g key={index}>
          <line x1="390" y1="72" x2={318 + index * 36} y2="104"
                stroke="var(--accent)" opacity="0.8" markerEnd="url(#ge-many)" />
          <rect x={306 + index * 36} y="110" width="24" height="24" rx="4"
                fill="var(--card)" stroke="var(--accent)" opacity="0.8" />
        </g>
      ))}

      <text x="390" y="166" textAnchor="middle" style={faint}>wherever there is</text>
      <text x="390" y="181" textAnchor="middle" style={faint}>capacity right now</text>
    </svg>
  );
}

function SdkCall() {
  const stages = [
    { title: "Your code", note: "one function call" },
    { title: "The SDK", note: "signs and sends it" },
    { title: "The endpoint", note: "picks a model host" },
    { title: "Gemini", note: "answers" },
  ];

  return (
    <svg viewBox="0 0 520 172" role="img"
         aria-label="A request travelling from your code through the SDK to the model and back">
      <defs>
        <Arrow id="sdk-out" color="var(--accent)" />
        <Arrow id="sdk-back" color="var(--hairline-strong)" />
      </defs>

      {stages.map((stage, index) => {
        const x = 16 + index * 128;
        return (
          <g key={stage.title}>
            <rect x={x} y={44} width={108} height={48} rx="8"
                  fill={index === 3
                    ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                    : "var(--card)"}
                  stroke={index === 3 ? "var(--accent)" : "var(--hairline-strong)"} />
            <text x={x + 54} y={66} textAnchor="middle" style={strong}>{stage.title}</text>
            <text x={x + 54} y={82} textAnchor="middle" style={faint}>{stage.note}</text>
            {index < 3 && (
              <line x1={x + 110} y1={62} x2={x + 126} y2={62}
                    stroke="var(--accent)" markerEnd="url(#sdk-out)" />
            )}
          </g>
        );
      })}

      <path d="M462 96 v16 H70 v-14" fill="none" stroke="var(--hairline-strong)"
            markerEnd="url(#sdk-back)" />
      <text x="266" y="134" textAnchor="middle" style={faint}>
        JSON back, in the shape the request asked for
      </text>
      <text x="266" y="24" textAnchor="middle" style={label}>
        No key travels with the request — your Google Cloud credentials sign it
      </text>
    </svg>
  );
}

function SettingsNotCode() {
  return (
    <svg viewBox="0 0 520 190" role="img"
         aria-label="Settings in a file the code reads, rather than values written into the code">
      <defs><Arrow id="settings-arrow" color="var(--accent)" /></defs>

      <rect x="24" y="44" width="196" height="116" rx="9" fill="var(--code-bg)"
            stroke="var(--accent)" />
      <text x="122" y="32" textAnchor="middle" style={label}>app/.env</text>
      {[
        "GOOGLE_GENAI_USE_VERTEXAI",
        "GOOGLE_CLOUD_PROJECT",
        "GOOGLE_CLOUD_LOCATION",
        "DINO_MODEL",
      ].map((key, index) => (
        <text key={key} x="40" y={70 + index * 24}
              style={{ ...mono, fontSize: 9, fill: "var(--code-fg)" }}>
          {key}
        </text>
      ))}

      <line x1="228" y1="102" x2="288" y2="102" stroke="var(--accent)"
            markerEnd="url(#settings-arrow)" />
      <text x="258" y="90" textAnchor="middle" style={faint}>at startup</text>

      <rect x="296" y="44" width="200" height="116" rx="9" fill="var(--card)"
            stroke="var(--hairline-strong)" />
      <text x="396" y="32" textAnchor="middle" style={label}>app/main.py</text>
      <text x="396" y="94" textAnchor="middle" style={strong}>names no project</text>
      <text x="396" y="114" textAnchor="middle" style={strong}>and no endpoint</text>
      <text x="396" y="138" textAnchor="middle" style={faint}>
        the same file works on any machine
      </text>

      <text x="260" y="182" textAnchor="middle" style={faint}>
        What changes between machines goes in the file that is not committed.
      </text>
    </svg>
  );
}

function GridToSprite() {
  const rows = [
    "....GGGG....",
    "...GGGGGG...",
    "...GGWGGG...",
    "....GGGG....",
    "..GGGGGGGG..",
    "..GGGGGGGG..",
    "..DDGGGGDD..",
    "....DD.DD...",
  ];

  return (
    <svg viewBox="0 0 520 210" role="img"
         aria-label="Letters and colours from the model, turned into a sprite">
      <defs><Arrow id="grid-arrow" color="var(--accent)" /></defs>

      <text x="86" y="26" textAnchor="middle" style={label}>What the model sends</text>
      <rect x="20" y="36" width="132" height="126" rx="7" fill="var(--code-bg)"
            stroke="var(--hairline)" />
      {rows.map((row, index) => (
        <text key={index} x="30" y={54 + index * 14}
              style={{ ...mono, fontSize: 9, fill: "var(--code-fg)" }}>
          {row}
        </text>
      ))}
      <text x="86" y="178" textAnchor="middle" style={faint}>letters, plus a colour</text>
      <text x="86" y="192" textAnchor="middle" style={faint}>for each letter</text>

      <line x1="166" y1="98" x2="212" y2="98" stroke="var(--accent)"
            markerEnd="url(#grid-arrow)" />
      <text x="189" y="88" textAnchor="middle" style={faint}>24 lines</text>

      <text x="284" y="26" textAnchor="middle" style={label}>What your code does</text>
      <rect x="224" y="36" width="120" height="126" rx="7" fill="var(--card)"
            stroke="var(--hairline-strong)" />
      <text x="284" y="92" textAnchor="middle" style={strong}>writes a PNG</text>
      <text x="284" y="112" textAnchor="middle" style={faint}>40 lines, no library</text>

      <line x1="356" y1="98" x2="402" y2="98" stroke="var(--accent)"
            markerEnd="url(#grid-arrow)" />

      <text x="452" y="26" textAnchor="middle" style={label}>What the game loads</text>
      <rect x="414" y="36" width="80" height="126" rx="7"
            fill="color-mix(in srgb, var(--accent) 12%, transparent)"
            stroke="var(--accent)" />
      {rows.map((row, y) =>
        row.split("").map((cell, x) =>
          cell === "." ? null : (
            <rect key={`${x}-${y}`} x={424 + x * 5.5} y={52 + y * 9} width="5" height="8"
                  fill={cell === "W" ? "var(--fg)" : cell === "D"
                    ? "color-mix(in srgb, var(--accent) 55%, black)"
                    : "var(--accent)"} />
          ),
        ),
      )}
      <text x="452" y="150" textAnchor="middle" style={{ ...mono, fontSize: 9 }}>
        dino.png
      </text>
    </svg>
  );
}

/* ── step 7 ─────────────────────────────────────────────────────────────── */

function ContainerUnit() {
  const inside = ["your code", "the Python runtime", "its dependencies"];

  return (
    <svg viewBox="0 0 520 224" role="img"
         aria-label="A container holding code, runtime and dependencies, above an interchangeable machine">
      <text x={260} y={22} textAnchor="middle" style={label}>
        One image, sealed
      </text>

      <rect x={148} y={34} width={224} height={116} rx="11"
            fill="color-mix(in srgb, var(--accent) 10%, transparent)"
            stroke="var(--accent)" strokeWidth="1.5" />
      {inside.map((item, index) => (
        <g key={item}>
          <rect x={172} y={50 + index * 34} width={176} height={26} rx="6"
                fill="var(--card)" stroke="var(--hairline-strong)" />
          <text x={260} y={67 + index * 34} textAnchor="middle" style={faint}>
            {item}
          </text>
        </g>
      ))}

      <text x={260} y={168} textAnchor="middle" style={faint}>
        everything it needs to start
      </text>

      {/* the machine underneath, deliberately vague */}
      <rect x={60} y={182} width={400} height={30} rx="7" fill="none"
            stroke="var(--hairline-strong)" strokeDasharray="6 5" />
      <text x={260} y={202} textAnchor="middle" style={{ ...faint, fill: "var(--fg-faint)" }}>
        some machine, somewhere — not your problem, and not in the image
      </text>
    </svg>
  );
}

function DeployPipeline() {
  const steps = [
    { title: "app/", note: "your source", accent: false },
    { title: "Cloud Build", note: "makes the image", accent: false },
    { title: "Artifact Registry", note: "keeps the image", accent: false },
    { title: "Cloud Run", note: "runs it", accent: true },
  ];

  return (
    <svg viewBox="0 0 520 226" role="img"
         aria-label="Source uploaded, built into an image, stored, then run as a service with a public address">
      <defs><Arrow id="dp-a" color="var(--accent)" /></defs>

      <text x={260} y={22} textAnchor="middle" style={label}>
        One request, four things
      </text>

      {steps.map((step, index) => {
        const x = 8 + index * 128;
        return (
          <g key={step.title}>
            <rect x={x} y={44} width={112} height={52} rx="9"
                  fill={step.accent
                    ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                    : "var(--card)"}
                  stroke={step.accent ? "var(--accent)" : "var(--hairline-strong)"} />
            <text x={x + 56} y={68} textAnchor="middle" style={strong}>{step.title}</text>
            <text x={x + 56} y={85} textAnchor="middle" style={faint}>{step.note}</text>
            <text x={x + 56} y={36} textAnchor="middle"
                  style={{ ...mono, fontSize: 9, fill: "var(--fg-faint)" }}>
              {index + 1}
            </text>
            {index < 3 && (
              <line x1={x + 114} y1={70} x2={x + 126} y2={70}
                    stroke="var(--accent)" markerEnd="url(#dp-a)" />
            )}
          </g>
        );
      })}

      {/* where the time goes */}
      <path d="M136 106 v10 h240 v-10" fill="none" stroke="var(--hairline-strong)" />
      <text x={256} y={132} textAnchor="middle" style={faint}>
        this is the few minutes you wait the first time
      </text>

      <rect x={160} y={156} width={200} height={34} rx="8"
            fill="var(--code-bg)" stroke="var(--ok)" />
      <text x={260} y={178} textAnchor="middle"
            style={{ ...mono, fill: "var(--ok)" }}>
        https://…run.app
      </text>
      <line x1={400} y1={98} x2={400} y2={172} stroke="var(--accent)" />
      <line x1={400} y1={172} x2={366} y2={172} stroke="var(--accent)"
            markerEnd="url(#dp-a)" />

      <text x={260} y={212} textAnchor="middle" style={faint}>
        Deploy again and the address stays the same.
      </text>
    </svg>
  );
}

function WhatChangesDeployed() {
  const columns = [
    {
      x: 12,
      title: "On your machine",
      accent: false,
      identity: "you",
      identityNote: "already had access to both",
      settings: "app/.env",
      settingsNote: "a file, read at startup",
    },
    {
      x: 276,
      title: "On Cloud Run",
      accent: true,
      identity: "a service account",
      identityNote: "granted nothing until you do",
      settings: "on the service",
      settingsNote: "app/.env is not in the image",
    },
  ];

  return (
    <svg viewBox="0 0 520 252" role="img"
         aria-label="The same app running as you with a local settings file, and running as a service account with settings on the service">
      {columns.map((column) => {
        const edge = column.accent ? "var(--accent)" : "var(--hairline-strong)";
        const mid = column.x + 116;
        return (
          <g key={column.title}>
            <rect x={column.x} y={30} width={232} height={188} rx="10"
                  fill={column.accent
                    ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                    : "var(--card)"}
                  stroke={edge} strokeWidth={column.accent ? 1.5 : 1} />

            <text x={mid} y={22} textAnchor="middle" style={label}>{column.title}</text>

            {/* the app is the one thing that does not change */}
            <rect x={column.x + 52} y={44} width={128} height={30} rx="7"
                  fill="var(--card)" stroke="var(--hairline-strong)" />
            <text x={mid} y={64} textAnchor="middle" style={strong}>DinoQuest</text>

            <line x1={column.x + 20} y1={90} x2={column.x + 212} y2={90}
                  stroke="var(--hairline)" />

            <text x={column.x + 20} y={110} style={{ ...mono, fontSize: 9 }}>
              it calls Firestore and Gemini as
            </text>
            <text x={column.x + 20} y={130} style={strong}>{column.identity}</text>
            <text x={column.x + 20} y={146} style={faint}>{column.identityNote}</text>

            <line x1={column.x + 20} y1={160} x2={column.x + 212} y2={160}
                  stroke="var(--hairline)" />

            <text x={column.x + 20} y={180} style={{ ...mono, fontSize: 9 }}>
              its settings live
            </text>
            <text x={column.x + 20} y={198} style={strong}>{column.settings}</text>
            <text x={column.x + 20} y={212} style={faint}>{column.settingsNote}</text>
          </g>
        );
      })}

      <text x={260} y={244} textAnchor="middle" style={faint}>
        The code is identical. What changes is who it is, and where its settings come from.
      </text>
    </svg>
  );
}

function ColdStart() {
  /* Response time as bar height: the first request pays for the start, the
     ones behind it do not. */
  const requests = [
    { label: "1st", height: 62, cold: true },
    { label: "2nd", height: 14, cold: false },
    { label: "3rd", height: 12, cold: false },
    { label: "4th", height: 13, cold: false },
  ];
  const base = 150;

  return (
    <svg viewBox="0 0 520 220" role="img"
         aria-label="The first request waits for a copy to start; the requests behind it do not">
      <text x={260} y={22} textAnchor="middle" style={label}>
        What scaling to zero costs, and when
      </text>

      {/* nothing running */}
      <rect x={20} y={64} width={128} height={86} rx="9" fill="none"
            stroke="var(--hairline-strong)" strokeDasharray="6 5" />
      <text x={84} y={100} textAnchor="middle" style={strong}>nothing</text>
      <text x={84} y={117} textAnchor="middle" style={strong}>running</text>
      <text x={84} y={136} textAnchor="middle" style={{ ...faint, fill: "var(--ok)" }}>
        costs nothing
      </text>

      <line x1={160} y1={base} x2={500} y2={base} stroke="var(--hairline-strong)" />

      {requests.map((request, index) => {
        const x = 186 + index * 74;
        const colour = request.cold ? "var(--amber)" : "var(--ok)";
        return (
          <g key={request.label}>
            <rect x={x} y={base - request.height} width={42} height={request.height}
                  rx="3" fill={colour} opacity={request.cold ? 0.55 : 0.75} />
            <text x={x + 21} y={base + 16} textAnchor="middle" style={faint}>
              {request.label}
            </text>
            {request.cold && (
              <text x={x + 21} y={base - request.height - 8} textAnchor="middle"
                    style={{ ...faint, fill: "var(--amber)" }}>
                cold start
              </text>
            )}
          </g>
        );
      })}

      <text x={352} y={190} textAnchor="middle" style={faint}>
        time to answer, request by request
      </text>
      <text x={260} y={210} textAnchor="middle" style={{ ...faint, fill: "var(--fg-faint)" }}>
        The wait is the price of not paying for a machine nobody was using.
      </text>
    </svg>
  );
}

function Revisions() {
  const list = [
    { name: "revision 3", note: "the deploy you just made", live: true },
    { name: "revision 2", note: "still here", live: false },
    { name: "revision 1", note: "still here", live: false },
  ];

  return (
    <svg viewBox="0 0 520 210" role="img"
         aria-label="Each deployment makes a new revision; traffic points at one and can be pointed back">
      <defs>
        <Arrow id="rev-a" color="var(--accent)" />
        <Arrow id="rev-b" color="var(--amber)" />
      </defs>

      <text x={260} y={22} textAnchor="middle" style={label}>
        Every deployment adds one. None are removed.
      </text>

      {list.map((item, index) => {
        const y = 40 + index * 50;
        const colour = item.live ? "var(--accent)" : "var(--hairline-strong)";
        return (
          <g key={item.name}>
            <rect x={196} y={y} width={196} height={40} rx="8"
                  fill={item.live
                    ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                    : "var(--card)"}
                  stroke={colour} />
            <text x={294} y={y + 18} textAnchor="middle" style={strong}>{item.name}</text>
            <text x={294} y={y + 32} textAnchor="middle" style={faint}>{item.note}</text>
          </g>
        );
      })}

      <text x={96} y={56} style={label}>traffic</text>
      <line x1={140} y1={60} x2={188} y2={60} stroke="var(--accent)" strokeWidth="2"
            markerEnd="url(#rev-a)" />

      <path d="M140 66 v44 h44" fill="none" stroke="var(--amber)" strokeDasharray="5 4"
            markerEnd="url(#rev-b)" />
      <text x={20} y={100} style={{ ...faint, fill: "var(--amber)" }}>
        rollback points it
      </text>
      <text x={20} y={114} style={{ ...faint, fill: "var(--amber)" }}>
        at an older one
      </text>

      <text x={260} y={196} textAnchor="middle" style={faint}>
        A rollback changes where traffic goes. Nothing is rebuilt, so it takes seconds.
      </text>
    </svg>
  );
}

/* ── step 9 ─────────────────────────────────────────────────────────────── */

function AiStudioToCloud() {
  const badge = (x: number, y: number, text: string) => (
    <g>
      <rect x={x} y={y} width={40} height={15} rx="7.5"
            fill="color-mix(in srgb, var(--accent) 16%, transparent)"
            stroke="var(--accent)" strokeWidth="0.8" />
      <text x={x + 20} y={y + 11} textAnchor="middle"
            style={{ fontSize: 9, fill: "var(--accent)", fontWeight: 600,
                     fontFamily: "inherit" }}>
        {text}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 520 296" role="img"
         aria-label="AI Studio Build mode deploying an app to Cloud Run with a database, in a project Google manages">
      <defs>
        <Arrow id="ais-a" color="var(--accent)" />
        <Arrow id="ais-g" color="var(--fg-faint)" />
      </defs>

      {/* what you do */}
      <rect x={14} y={70} width={132} height={72} rx="10"
            fill="color-mix(in srgb, var(--accent) 12%, transparent)"
            stroke="var(--accent)" strokeWidth="1.4" />
      <text x={80} y={96} textAnchor="middle" style={strong}>AI Studio</text>
      <text x={80} y={113} textAnchor="middle" style={faint}>Build mode</text>
      <text x={80} y={130} textAnchor="middle" style={faint}>you describe the app</text>

      <path d="M150 106 h40" stroke="var(--accent)" strokeWidth="2"
            markerEnd="url(#ais-a)" />
      <text x={170} y={98} textAnchor="middle" style={faint}>Deploy</text>

      {/* what it makes */}
      <rect x={198} y={34} width={308} height={196} rx="12" fill="none"
            stroke="var(--violet)" strokeWidth="1.2" strokeDasharray="7 5" />
      <text x={212} y={52} style={{ ...faint, fill: "var(--violet)" }}>
        a project Google creates and runs for you
      </text>

      <rect x={216} y={68} width={124} height={54} rx="9"
            fill="color-mix(in srgb, var(--accent) 12%, transparent)"
            stroke="var(--accent)" strokeWidth="1.3" />
      <text x={278} y={90} textAnchor="middle" style={strong}>Cloud Run</text>
      <text x={278} y={107} textAnchor="middle" style={faint}>scales to zero</text>
      {badge(362, 80, "step 7")}

      <Box x={216} y={140} w={124} h={38} title="Firestore" note="records" />
      {badge(362, 150, "step 5")}

      <Box x={216} y={186} w={124} h={34} title="Cloud SQL" note="PostgreSQL" />

      <path d="M278 124 v12" stroke="var(--fg-faint)" markerEnd="url(#ais-g)" />
      <path d="M278 180 v2" stroke="var(--fg-faint)" markerEnd="url(#ais-g)" />

      <text x={418} y={196} textAnchor="middle" style={faint}>the agent</text>
      <text x={418} y={210} textAnchor="middle" style={faint}>picks one</text>

      <text x={260} y={256} textAnchor="middle" style={label}>
        The same pieces this course built by hand
      </text>
      <text x={260} y={276} textAnchor="middle" style={faint}>
        Your own project and billing account are the other path, and the one that scales.
      </text>
    </svg>
  );
}

function AntigravityStack() {
  const surfaces = ["Antigravity 2.0", "CLI", "IDE", "SDK"];

  return (
    <svg viewBox="0 0 520 300" role="img"
         aria-label="Antigravity surfaces over one agent harness, reaching MCP servers and agent skills">
      <defs><Arrow id="ag-a" color="var(--accent)" /></defs>

      <text x={260} y={22} textAnchor="middle" style={label}>
        Four ways in, one agent underneath
      </text>

      {surfaces.map((name, index) => {
        const x = 16 + index * 124;
        return (
          <g key={name}>
            <rect x={x} y={34} width={112} height={38} rx="8" fill="var(--card)"
                  stroke="var(--hairline-strong)" />
            <text x={x + 56} y={58} textAnchor="middle" style={strong}>{name}</text>
            <path d={`M${x + 56} 74 v18`} stroke="var(--hairline-strong)" />
          </g>
        );
      })}

      <path d="M72 92 H448" stroke="var(--hairline-strong)" />
      <path d="M260 92 v14" stroke="var(--accent)" markerEnd="url(#ag-a)" />

      <rect x={150} y={112} width={220} height={46} rx="9"
            fill="color-mix(in srgb, var(--accent) 14%, transparent)"
            stroke="var(--accent)" strokeWidth="1.4" />
      <text x={260} y={132} textAnchor="middle" style={strong}>one agent harness</text>
      <text x={260} y={148} textAnchor="middle" style={faint}>co-trained with Gemini</text>

      {/* what it reaches for */}
      <path d="M200 160 v22 H120 v14" fill="none" stroke="var(--accent)"
            markerEnd="url(#ag-a)" />
      <path d="M320 160 v22 H400 v14" fill="none" stroke="var(--accent)"
            markerEnd="url(#ag-a)" />

      <rect x={20} y={196} width={200} height={82} rx="9" fill="var(--card)"
            stroke="var(--hairline-strong)" />
      <text x={120} y={218} textAnchor="middle" style={strong}>MCP servers</text>
      <text x={120} y={236} textAnchor="middle" style={{ ...mono, fontSize: 9 }}>
        Developer Knowledge
      </text>
      <text x={120} y={252} textAnchor="middle" style={faint}>the official docs,</text>
      <text x={120} y={266} textAnchor="middle" style={faint}>re-indexed daily</text>

      <rect x={300} y={196} width={200} height={82} rx="9" fill="var(--card)"
            stroke="var(--hairline-strong)" />
      <text x={400} y={218} textAnchor="middle" style={strong}>Agent skills</text>
      <text x={400} y={236} textAnchor="middle" style={{ ...mono, fontSize: 9 }}>
        SKILL.md
      </text>
      <text x={400} y={252} textAnchor="middle" style={faint}>instructions and scripts</text>
      <text x={400} y={266} textAnchor="middle" style={faint}>you add yourself</text>
    </svg>
  );
}

/* ── registry ───────────────────────────────────────────────────────────── */

const FIGURES: Record<string, () => ReactNode> = {
  globe: Globe,
  categories: Categories,
  "how-much-machine": HowMuchMachine,
  architecture: Architecture,
  localhost: Localhost,
  "app-shape": AppShape,
  "scores-in-memory": ScoresInMemory,
  "process-boundary": ProcessBoundary,
  "database-options": DatabaseOptions,
  "nothing-to-provision": NothingToProvision,
  "two-changes": TwoChanges,
  "four-problems": FourProblems,
  "preview-tunnel": PreviewTunnel,
  "rent-vs-own": RentVsOwn,
  "three-traits": ThreeTraits,
  "rent-three": RentThree,
  "project-box": ProjectBox,
  "three-names": ThreeNames,
  "billing-link": BillingLink,
  "budget-alert": BudgetAlert,
  "api-switches": ApiSwitches,
  "error-anatomy": ErrorAnatomy,
  "rent-intelligence": RentIntelligence,
  "own-a-model": OwnAModel,
  "model-modalities": ModelModalities,
  "model-cycle": ModelCycle,
  "agent-pillars": AgentPillars,
  "container-unit": ContainerUnit,
  "deploy-pipeline": DeployPipeline,
  "what-changes-deployed": WhatChangesDeployed,
  "cold-start": ColdStart,
  "revisions": Revisions,
  "ai-studio-to-cloud": AiStudioToCloud,
  "antigravity-stack": AntigravityStack,
  "model-garden": ModelGarden,
  "global-endpoint": GlobalEndpoint,
  "sdk-call": SdkCall,
  "settings-not-code": SettingsNotCode,
  "grid-to-sprite": GridToSprite,
};

export function Figure({ id, caption }: { id: string; caption: string }) {
  const Drawing = FIGURES[id];

  return (
    <figure className="my-7">
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--overlay)", borderColor: "var(--hairline)" }}
      >
        {Drawing ? (
          <Drawing />
        ) : (
          <div
            className="grid h-28 place-items-center rounded-lg text-sm"
            style={{ background: "var(--card)", color: "var(--fg-faint)" }}
          >
            figure “{id || "unnamed"}” not drawn yet
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-sm" style={{ color: "var(--fg-faint)" }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
