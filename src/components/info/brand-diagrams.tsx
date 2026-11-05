// Annotated drawings for the brand guidelines. Pure SVG built from the same path data
// as <Logo/>, so the diagrams can never drift from the real mark.
import { MarkGlyphs } from "@/components/brand/logo";
import { LOCKUP, MARK, WORDMARK } from "@/components/brand/logo-data";

const INK = "#0F0E0D";
const BONE = "#F3EEE5";
const RED = "#FF4A1C";
const SMOKE = "#6B645D";

const MONO = { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" } as const;

const guide = {
  fill: "none",
  stroke: RED,
  strokeOpacity: 0.6,
  strokeWidth: 0.6,
  strokeDasharray: "2.4 2.4",
} as const;

/** Lockup artwork in its own coordinate space (baseline at y=0), identical to <Logo/>. */
function LockupArt({ tone = "ink" }: { tone?: "ink" | "bone" }) {
  const s = LOCKUP.markScale;
  return (
    <>
      <g transform={`translate(${-12 * s} ${-116 * s}) scale(${s})`}>
        <MarkGlyphs tone={tone} />
      </g>
      <g transform={`translate(${174 * s + LOCKUP.gap} 0)`}>
        <path d={WORDMARK.d} fill={tone === "ink" ? INK : BONE} />
        <circle cx={WORDMARK.dot.cx} cy={WORDMARK.dot.cy} r={WORDMARK.dot.r} fill={RED} />
      </g>
    </>
  );
}

function Callout({ n, x, y, to }: { n: number; x: number; y: number; to: [number, number] }) {
  return (
    <g>
      <line x1={x} y1={y} x2={to[0]} y2={to[1]} stroke={INK} strokeWidth={0.6} />
      <circle cx={to[0]} cy={to[1]} r={1.6} fill={INK} />
      <circle cx={x} cy={y} r={6.5} fill={RED} />
      <text x={x} y={y + 2.4} textAnchor="middle" fontSize={7} fontWeight={600} fill={INK} style={MONO}>
        {n}
      </text>
    </g>
  );
}

/** The mark on a construction grid: guides, the 94-unit record spacing and numbered callouts. */
export function MarkConstruction({ className }: { className?: string }) {
  const { cx, cy, r } = MARK.ball;
  const cx2 = cx + MARK.glyphDx;
  return (
    <svg
      viewBox="-18 -30 232 186"
      className={className}
      role="img"
      aria-label="Construction drawing of the Lyricshop mark: an opening quotation mark whose two dots are vinyl records with red labels"
    >
      <defs>
        <pattern id="ls-construction-grid" width="10" height="10" patternUnits="userSpaceOnUse" x="-2" y="-2">
          <path d="M10 0H0V10" fill="none" stroke={INK} strokeOpacity={0.08} strokeWidth={0.4} />
        </pattern>
      </defs>
      <rect x="-18" y="-30" width="232" height="186" fill="url(#ls-construction-grid)" />

      {/* guides: cap line, spindle line, baseline and the two record centres */}
      <line x1="-18" x2="214" y1="4" y2="4" {...guide} />
      <line x1="-18" x2="214" y1={cy} y2={cy} {...guide} />
      <line x1="-18" x2="214" y1={cy + r} y2={cy + r} {...guide} />
      <line x1={cx} x2={cx} y1="-30" y2="156" {...guide} />
      <line x1={cx2} x2={cx2} y1="-30" y2="156" {...guide} />
      <circle cx={cx} cy={cy} r={r + 6} {...guide} />
      <circle cx={cx2} cy={cy} r={r + 6} {...guide} />

      <MarkGlyphs tone="ink" />

      {/* record spacing */}
      <g stroke={INK} strokeWidth={0.6}>
        <line x1={cx} x2={cx2} y1={140} y2={140} />
        <line x1={cx} x2={cx} y1={136} y2={144} />
        <line x1={cx2} x2={cx2} y1={136} y2={144} />
      </g>
      <text x={(cx + cx2) / 2} y={136.5} textAnchor="middle" fontSize={6} fill={INK} style={MONO}>
        94
      </text>

      {/* record diameter */}
      <g stroke={INK} strokeWidth={0.6}>
        <line x1={cx - r} x2={cx + r} y1={-16} y2={-16} />
        <line x1={cx - r} x2={cx - r} y1={-20} y2={-12} />
        <line x1={cx + r} x2={cx + r} y1={-20} y2={-12} />
      </g>
      <text x={cx - r - 3} y={-14} textAnchor="end" fontSize={6} fill={INK} style={MONO}>
        ⌀ 76
      </text>

      <text x="211" y="1.6" textAnchor="end" fontSize={5} fill={SMOKE} style={MONO}>
        CAP
      </text>
      <text x="211" y={cy - 2.4} textAnchor="end" fontSize={5} fill={SMOKE} style={MONO}>
        SPINDLE
      </text>
      <text x="211" y={cy + r - 2.4} textAnchor="end" fontSize={5} fill={SMOKE} style={MONO}>
        BASELINE
      </text>

      <Callout n={1} x={-4} y={22} to={[24, 36]} />
      <Callout n={2} x={196} y={30} to={[cx2 + 21, cy - 21]} />
      <Callout n={3} x={196} y={128} to={[cx2 + 8, cy + 9]} />
    </svg>
  );
}

/** The wordmark with its type lines and the on-air dot called out. */
export function WordmarkAnatomy({ className }: { className?: string }) {
  const { cx, cy, r } = WORDMARK.dot;
  const lines = [
    { y: -70, label: "ASCENDER" },
    { y: -52.8, label: "X-HEIGHT" },
    { y: 0, label: "BASELINE" },
    { y: 15.6, label: "DESCENDER" },
  ];
  return (
    <svg
      viewBox="-6 -112 492 146"
      className={className}
      role="img"
      aria-label="The lowercase lyricshop wordmark with its ascender, x-height, baseline and descender marked, and the red on-air dot over the i called out"
    >
      {lines.map((l) => (
        <g key={l.label}>
          <line x1="-6" x2="408" y1={l.y} y2={l.y} {...guide} strokeOpacity={0.45} />
          <text x="414" y={l.y + 2.2} fontSize={6.5} fill={SMOKE} style={MONO}>
            {l.label}
          </text>
        </g>
      ))}
      <path d={WORDMARK.d} fill={INK} />
      <circle cx={cx} cy={cy} r={r} fill={RED} />
      <circle cx={cx} cy={cy} r={r + 7} fill="none" stroke={INK} strokeWidth={0.8} strokeDasharray="2.4 2.4" />
      <path d={`M${cx + r + 5} ${cy - r - 4}L${cx + 40} -100H${cx + 60}`} fill="none" stroke={INK} strokeWidth={0.8} />
      <text x={cx + 64} y={-97.6} fontSize={8} fill={INK} style={MONO}>
        ON-AIR LIGHT
      </text>
    </svg>
  );
}

function DotPair({ x, y, r, vertical = false }: { x: number; y: number; r: number; vertical?: boolean }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill={RED} />
      <circle cx={vertical ? x : x + r * 2} cy={vertical ? y + r * 2 : y} r={r} fill={RED} />
    </>
  );
}

/** Clear space around the lockup, measured in on-air dots (two on every side). */
export function LockupClearSpace({ className }: { className?: string }) {
  const art = { x0: 0, x1: 520.7, y0: -74.7, y1: 15.6 };
  const r = WORDMARK.dot.r;
  const u = r * 4; // two dots
  const zone = { x: art.x0 - u, y: art.y0 - u, w: art.x1 - art.x0 + u * 2, h: art.y1 - art.y0 + u * 2 };
  const midX = (art.x0 + art.x1) / 2;
  const midY = (art.y0 + art.y1) / 2;
  return (
    <svg
      viewBox={`${zone.x - 18} ${zone.y - 18} ${zone.w + 36} ${zone.h + 36}`}
      className={className}
      role="img"
      aria-label="The Lyricshop lockup inside its clear space: two on-air dots of room on every side"
    >
      <rect {...{ x: zone.x, y: zone.y, width: zone.w, height: zone.h }} fill={RED} fillOpacity={0.06} />
      <rect {...{ x: zone.x, y: zone.y, width: zone.w, height: zone.h }} {...guide} strokeWidth={1.2} strokeDasharray="5 4" />
      <rect
        {...{ x: art.x0, y: art.y0, width: art.x1 - art.x0, height: art.y1 - art.y0 }}
        fill="none"
        stroke={SMOKE}
        strokeOpacity={0.5}
        strokeWidth={0.8}
      />
      <LockupArt />
      <DotPair x={art.x0 - u + r} y={midY} r={r} />
      <DotPair x={art.x1 + r} y={midY} r={r} />
      <DotPair x={midX} y={art.y0 - u + r} r={r} vertical />
      <DotPair x={midX} y={art.y1 + r} r={r} vertical />
    </svg>
  );
}

/** Clear space around the mark on its own: one record label on every side. */
export function MarkClearSpace({ className }: { className?: string }) {
  const art = { x0: 12, x1: 182, y0: 4, y1: 116 };
  const r = 14; // the red label
  const u = r * 2;
  const zone = { x: art.x0 - u, y: art.y0 - u, w: art.x1 - art.x0 + u * 2, h: art.y1 - art.y0 + u * 2 };
  const midX = (art.x0 + art.x1) / 2;
  const midY = (art.y0 + art.y1) / 2;
  return (
    <svg
      viewBox={`${zone.x - 10} ${zone.y - 10} ${zone.w + 20} ${zone.h + 20}`}
      className={className}
      role="img"
      aria-label="The Lyricshop mark inside its clear space: one record label of room on every side"
    >
      <rect {...{ x: zone.x, y: zone.y, width: zone.w, height: zone.h }} fill={RED} fillOpacity={0.06} />
      <rect {...{ x: zone.x, y: zone.y, width: zone.w, height: zone.h }} {...guide} strokeWidth={1} strokeDasharray="4 3" />
      <rect
        {...{ x: art.x0, y: art.y0, width: art.x1 - art.x0, height: art.y1 - art.y0 }}
        fill="none"
        stroke={SMOKE}
        strokeOpacity={0.5}
        strokeWidth={0.6}
      />
      <MarkGlyphs tone="ink" />
      <circle cx={art.x0 - r} cy={midY} r={r} fill={RED} />
      <circle cx={art.x1 + r} cy={midY} r={r} fill={RED} />
      <circle cx={midX} cy={art.y0 - r} r={r} fill={RED} />
      <circle cx={midX} cy={art.y1 + r} r={r} fill={RED} />
    </svg>
  );
}
