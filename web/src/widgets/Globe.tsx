import { useEffect, useRef, useState } from "react";

/* A globe you can spin, with Google Cloud regions on it.

   Orthographic projection, worked out in a few lines: everything on the far
   side of the sphere is simply not drawn. The land outlines are deliberately
   coarse -- enough to know which continent you are looking at, not an atlas.

   The arcs between regions stand for the provider's own network. They are the
   reason a request from London to Tokyo behaves better than the distance
   suggests, and they are the point of the figure. */

type Place = { id: string; where: string; lon: number; lat: number };

const REGIONS: Place[] = [
  { id: "us-west1", where: "Oregon", lon: -121.2, lat: 45.6 },
  { id: "us-central1", where: "Iowa", lon: -93.6, lat: 41.9 },
  { id: "us-east4", where: "Virginia", lon: -77.5, lat: 39.0 },
  { id: "northamerica-northeast1", where: "Montréal", lon: -73.6, lat: 45.5 },
  { id: "southamerica-east1", where: "São Paulo", lon: -46.6, lat: -23.5 },
  { id: "europe-west2", where: "London", lon: -0.1, lat: 51.5 },
  { id: "europe-west1", where: "Belgium", lon: 4.4, lat: 50.5 },
  { id: "europe-west3", where: "Frankfurt", lon: 8.7, lat: 50.1 },
  { id: "me-central1", where: "Doha", lon: 51.5, lat: 25.3 },
  { id: "africa-south1", where: "Johannesburg", lon: 28.0, lat: -26.2 },
  { id: "asia-south1", where: "Mumbai", lon: 72.9, lat: 19.1 },
  { id: "asia-southeast1", where: "Singapore", lon: 103.8, lat: 1.4 },
  { id: "asia-northeast1", where: "Tokyo", lon: 139.7, lat: 35.7 },
  { id: "australia-southeast1", where: "Sydney", lon: 151.2, lat: -33.9 },
];

// Which regions the backbone is drawn between. Not the real topology: enough
// to show that the links run between continents, not through the internet.
const LINKS: [string, string][] = [
  ["us-west1", "asia-northeast1"],
  ["asia-northeast1", "asia-southeast1"],
  ["asia-southeast1", "australia-southeast1"],
  ["asia-southeast1", "asia-south1"],
  ["asia-south1", "me-central1"],
  ["me-central1", "europe-west3"],
  ["europe-west3", "europe-west1"],
  ["europe-west1", "europe-west2"],
  ["europe-west2", "us-east4"],
  ["us-east4", "us-central1"],
  ["us-central1", "us-west1"],
  ["us-east4", "northamerica-northeast1"],
  ["us-east4", "southamerica-east1"],
  ["southamerica-east1", "africa-south1"],
];

const LAND: [number, number][][] = [
  [[-168, 65], [-140, 60], [-125, 49], [-117, 32], [-105, 20], [-97, 16],
   [-83, 9], [-81, 25], [-75, 35], [-66, 45], [-56, 51], [-64, 60], [-78, 70],
   [-95, 70], [-125, 70], [-140, 70]],
  [[-45, 60], [-20, 70], [-20, 82], [-60, 82], [-55, 70]],
  [[-81, 0], [-75, -5], [-70, -18], [-70, -33], [-73, -45], [-66, -55],
   [-58, -34], [-48, -25], [-40, -20], [-35, -8], [-44, -2], [-50, 2],
   [-60, 5], [-70, 10], [-77, 8]],
  [[-10, 36], [-9, 43], [-2, 48], [5, 53], [11, 58], [18, 60], [30, 60],
   [40, 55], [45, 48], [40, 44], [28, 41], [15, 40], [8, 39], [-6, 36]],
  [[-17, 15], [-16, 22], [-10, 30], [0, 35], [20, 32], [32, 31], [35, 22],
   [43, 11], [51, 11], [48, 2], [40, -15], [32, -28], [25, -34], [18, -34],
   [12, -18], [9, -2], [2, 5], [-8, 5], [-14, 9]],
  [[45, 48], [60, 55], [70, 70], [90, 75], [110, 75], [130, 72], [160, 68],
   [170, 65], [145, 58], [140, 50], [130, 42], [122, 30], [110, 20],
   [105, 10], [95, 15], [88, 22], [80, 10], [72, 20], [62, 25], [50, 30],
   [45, 40]],
  [[113, -22], [115, -34], [130, -32], [138, -35], [146, -39], [153, -28],
   [145, -18], [142, -11], [132, -11], [125, -14]],
];

const SIZE = 340;
const R = 148;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RAD = Math.PI / 180;

function project(lon: number, lat: number, spin: number, tilt: number) {
  const la = lat * RAD;
  const lo = (lon - spin) * RAD;
  const t = tilt * RAD;
  const cosc = Math.sin(t) * Math.sin(la) + Math.cos(t) * Math.cos(la) * Math.cos(lo);
  return {
    visible: cosc >= 0,
    x: CX + R * Math.cos(la) * Math.sin(lo),
    y: CY - R * (Math.cos(t) * Math.sin(la) - Math.sin(t) * Math.cos(la) * Math.cos(lo)),
  };
}

function path(points: [number, number][], spin: number, tilt: number, close = false) {
  let d = "";
  let drawing = false;
  for (const [lon, lat] of close ? [...points, points[0]] : points) {
    const p = project(lon, lat, spin, tilt);
    if (!p.visible) {
      drawing = false;
      continue;
    }
    d += `${drawing ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    drawing = true;
  }
  return d;
}

/** A few points along the great circle, so the link bends with the sphere. */
function arc(a: Place, b: Place, spin: number, tilt: number) {
  const steps = 24;
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i += 1) {
    const f = i / steps;
    points.push([a.lon + (b.lon - a.lon) * f, a.lat + (b.lat - a.lat) * f]);
  }
  return path(points, spin, tilt);
}

export type Marker = { name: string; lon: number; lat: number; note?: string };

const DEGREES_PER_SECOND = 10;   // a turn every 36 seconds: clearly moving, not distracting

export function Globe({
  interactive = true,
  spinning = true,
  expandable = false,
  markers = [],
  highlight = [],
}: {
  interactive?: boolean;
  spinning?: boolean;
  /** Offer a control to make it bigger. Worth it where the reader is being
      asked to judge distances rather than just look. */
  expandable?: boolean;
  /** Places the reader should be looking at: cities in a scenario, say. */
  markers?: Marker[];
  /** Region ids to draw larger, because they are the options on offer. */
  highlight?: string[];
}) {
  const [spin, setSpin] = useState(-20);
  const [tilt, setTilt] = useState(18);
  const [hover, setHover] = useState<Place | null>(null);
  const [dragging, setDragging] = useState(false);
  const [big, setBig] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const nudged = useRef(false);

  // Turn at a steady rate in degrees per second, driven by the frame clock
  // rather than a timer: a timer competes with the re-render and ends up
  // creeping rather than turning.
  useEffect(() => {
    if (!spinning || dragging) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let previous = performance.now();
    const step = (now: number) => {
      const elapsed = (now - previous) / 1000;
      previous = now;
      setSpin((value) => value + DEGREES_PER_SECOND * elapsed);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spinning, dragging]);

  // Bring what the reader is being asked about into view, once.
  useEffect(() => {
    if (!markers.length) {
      nudged.current = false;
      return;
    }
    const lon = markers.reduce((sum, m) => sum + m.lon, 0) / markers.length;
    const lat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
    setSpin(lon);
    setTilt(Math.max(-55, Math.min(55, lat)));
    nudged.current = true;
  }, [markers]);

  const byId = Object.fromEntries(REGIONS.map((r) => [r.id, r]));

  return (
    <div>
      {/* The size lives on this wrapper rather than on the svg: an svg with a
          viewBox is a replaced element, and sizing it by max-width alone is
          easily overridden by a stylesheet. */}
      <div
        style={{
          width: "100%",
          maxWidth: big ? 720 : 420,
          margin: "0 auto",
          transition: "max-width 220ms ease",
        }}
      >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="A globe showing Google Cloud regions and the private network between them"
        style={{ width: "100%", height: "auto", display: "block",
                 cursor: interactive ? (dragging ? "grabbing" : "grab") : "default",
                 touchAction: "none" }}
        onPointerDown={(event) => {
          if (!interactive) return;
          setDragging(true);
          last.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging || !last.current) return;
          const dx = event.clientX - last.current.x;
          const dy = event.clientY - last.current.y;
          last.current = { x: event.clientX, y: event.clientY };
          setSpin((value) => value + dx * 0.4);
          setTilt((value) => Math.max(-75, Math.min(75, value + dy * 0.3)));
        }}
        onPointerUp={() => {
          setDragging(false);
          last.current = null;
        }}
      >
        <circle cx={CX} cy={CY} r={R} fill="var(--overlay)" stroke="var(--hairline-strong)" />

        {/* graticule */}
        {[-60, -30, 0, 30, 60].map((lat) => (
          <path key={`p${lat}`} fill="none" stroke="var(--hairline)" strokeWidth="0.6"
                d={path(Array.from({ length: 37 }, (_, i) => [i * 10 - 180, lat]), spin, tilt)} />
        ))}
        {[0, 30, 60, 90, 120, 150].map((lon) => (
          <path key={`m${lon}`} fill="none" stroke="var(--hairline)" strokeWidth="0.6"
                d={path(Array.from({ length: 19 }, (_, i) => [lon, i * 10 - 90]), spin, tilt)} />
        ))}

        {LAND.map((shape, index) => (
          <path key={index} d={path(shape, spin, tilt, true)}
                fill="color-mix(in srgb, var(--fg) 12%, transparent)"
                stroke="color-mix(in srgb, var(--fg) 26%, transparent)" strokeWidth="0.8" />
        ))}

        {LINKS.map(([from, to]) => (
          <path key={`${from}-${to}`} d={arc(byId[from], byId[to], spin, tilt)}
                fill="none" stroke="var(--accent)" strokeWidth="1.1" opacity="0.55" />
        ))}

        {REGIONS.map((place) => {
          const p = project(place.lon, place.lat, spin, tilt);
          if (!p.visible) return null;
          const lit = hover?.id === place.id;
          const offered = highlight.includes(place.id);
          return (
            <g key={place.id}
               onPointerEnter={() => setHover(place)}
               onPointerLeave={() => setHover(null)}>
              {offered && (
                <circle cx={p.x} cy={p.y} r="9" fill="none"
                        stroke="var(--accent)" strokeWidth="1.2" opacity="0.7" />
              )}
              <circle cx={p.x} cy={p.y} r={lit || offered ? 5.5 : 3.4}
                      fill="var(--accent)" opacity={highlight.length && !offered ? 0.35 : 1} />
              <circle cx={p.x} cy={p.y} r="11" fill="transparent" />
              {(lit || offered) && (
                <text x={p.x + 10} y={p.y - 8}
                      style={{ fontSize: 10.5, fill: "var(--fg)", fontWeight: 600,
                               fontFamily: "inherit" }}>
                  {place.where}
                </text>
              )}
            </g>
          );
        })}
        {markers.map((marker) => {
          const p = project(marker.lon, marker.lat, spin, tilt);
          if (!p.visible) return null;
          return (
            <g key={marker.name}>
              <path d={`M${p.x} ${p.y} l-5 -9 a5.6 5.6 0 1 1 10 0 z`}
                    fill="var(--amber)" stroke="var(--stage)" strokeWidth="0.8" />
              <circle cx={p.x} cy={p.y - 10} r="2.1" fill="var(--stage)" />
              <text x={p.x + 8} y={p.y + 2}
                    style={{ fontSize: 11, fill: "var(--amber)", fontWeight: 700,
                             fontFamily: "inherit" }}>
                {marker.name}
              </text>
              {marker.note && (
                <text x={p.x + 8} y={p.y + 14}
                      style={{ fontSize: 9.5, fill: "var(--fg-muted)", fontFamily: "inherit" }}>
                  {marker.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      </div>

      <div className="mt-2 flex items-center justify-center gap-3">
        <p className="text-center text-[0.78rem]" style={{ color: "var(--fg-faint)" }}>
          {hover ? (
            <>
              <span className="font-mono" style={{ color: "var(--fg)" }}>{hover.id}</span>
              {" · "}{hover.where}
            </>
          ) : interactive ? (
            "Drag to spin it. Hover a dot to name the region."
          ) : (
            "Regions, and the provider's own network between them."
          )}
        </p>

        {expandable && (
          <button
            type="button"
            onClick={() => setBig((value) => !value)}
            className="shrink-0 rounded-full border px-2.5 py-[3px] text-[0.7rem]"
            style={{ borderColor: "var(--hairline-strong)", color: "var(--fg-muted)" }}
          >
            {big ? "Smaller" : "Enlarge"}
          </button>
        )}
      </div>
    </div>
  );
}
