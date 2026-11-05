import { LOCKUP, MARK, WORDMARK } from "./logo-data";

type Tone = "ink" | "bone";
const INK = "#0F0E0D";
const BONE = "#F3EEE5";
const RED = "#FF4A1C";

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const rad = (a: number) => ((a - 90) * Math.PI) / 180;
  const p = (a: number) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))].map((n) => Math.round(n * 100) / 100);
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`;
}

/** The two-record quotation mark. `spin` turns the records slowly (hover states, loaders). */
export function MarkGlyphs({ tone = "ink", detail = true, spin = false }: { tone?: Tone; detail?: boolean; spin?: boolean }) {
  const body = tone === "ink" ? INK : BONE;
  const groove = tone === "ink" ? BONE : INK;
  const { cx, cy, r } = MARK.ball;
  return (
    <>
      {[0, MARK.glyphDx].map((dx) => (
        <g key={dx}>
          <path d={MARK.tail} transform={`translate(${dx} 0)`} fill={body} />
          <g
            style={
              spin
                ? { transformOrigin: `${cx + dx}px ${cy}px`, transformBox: "view-box", animation: "spin 2.4s linear infinite" }
                : undefined
            }
          >
            <circle cx={cx + dx} cy={cy} r={r} fill={body} />
            {detail && (
              <>
                {[32.5, 27.5, 22.5].map((gr) => (
                  <circle key={gr} cx={cx + dx} cy={cy} r={gr} fill="none" stroke={groove} strokeOpacity={0.28} strokeWidth={1.3} />
                ))}
                <path d={arc(cx + dx, cy, 29.5, 300, 338)} fill="none" stroke={groove} strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" />
                <path d={arc(cx + dx, cy, 29.5, 120, 158)} fill="none" stroke={groove} strokeOpacity={0.35} strokeWidth={2.4} strokeLinecap="round" />
              </>
            )}
            <circle cx={cx + dx} cy={cy} r={14} fill={RED} />
            <circle cx={cx + dx} cy={cy} r={2.8} fill={groove} />
          </g>
        </g>
      ))}
    </>
  );
}

export function Mark({
  tone = "ink",
  className,
  detail = true,
  spin = false,
  title = "Lyricshop",
}: {
  tone?: Tone;
  className?: string;
  detail?: boolean;
  spin?: boolean;
  title?: string;
}) {
  return (
    <svg viewBox={MARK.viewBox} className={className} role="img" aria-label={title}>
      <MarkGlyphs tone={tone} detail={detail} spin={spin} />
    </svg>
  );
}

export function Wordmark({ tone = "ink", className, title = "Lyricshop" }: { tone?: Tone; className?: string; title?: string }) {
  const fill = tone === "ink" ? INK : BONE;
  return (
    <svg viewBox={WORDMARK.viewBox} className={className} role="img" aria-label={title}>
      <path d={WORDMARK.d} fill={fill} />
      <circle cx={WORDMARK.dot.cx} cy={WORDMARK.dot.cy} r={WORDMARK.dot.r} fill={RED} />
    </svg>
  );
}

/** Horizontal lockup: mark + wordmark. Height drives size. */
export function Logo({ tone = "ink", className, title = "Lyricshop" }: { tone?: Tone; className?: string; title?: string }) {
  const s = LOCKUP.markScale;
  const markW = 174 * s;
  const fill = tone === "ink" ? INK : BONE;
  const vb = `-2 ${WORDMARK.top - 2} ${LOCKUP.width + 4} ${WORDMARK.bottom - WORDMARK.top + 4}`;
  return (
    <svg viewBox={vb} className={className} role="img" aria-label={title}>
      <g transform={`translate(${-12 * s} ${-116 * s}) scale(${s})`}>
        <MarkGlyphs tone={tone} />
      </g>
      <g transform={`translate(${markW + LOCKUP.gap} 0)`}>
        <path d={WORDMARK.d} fill={fill} />
        <circle cx={WORDMARK.dot.cx} cy={WORDMARK.dot.cy} r={WORDMARK.dot.r} fill={RED} />
      </g>
    </svg>
  );
}
