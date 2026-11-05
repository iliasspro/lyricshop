import { MARK } from "@/components/brand/logo-data";

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

/**
 * The two-record mark as plain SVG elements in the MARK.viewBox space. next/og (Satori) only accepts
 * intrinsic elements inside <svg>, so image routes use this instead of <MarkGlyphs/>.
 */
export function markShapes(tone: "ink" | "bone" = "bone", detail = true) {
  const body = tone === "ink" ? INK : BONE;
  const groove = tone === "ink" ? BONE : INK;
  const { cx, cy, r } = MARK.ball;
  return [0, MARK.glyphDx].flatMap((dx) => {
    const x = cx + dx;
    const shapes = [
      <path key={`tail-${dx}`} d={MARK.tail} transform={`translate(${dx} 0)`} fill={body} />,
      <circle key={`disc-${dx}`} cx={x} cy={cy} r={r} fill={body} />,
    ];
    if (detail) {
      for (const gr of [32.5, 27.5, 22.5]) {
        shapes.push(
          <circle key={`groove-${dx}-${gr}`} cx={x} cy={cy} r={gr} fill="none" stroke={groove} strokeOpacity={0.28} strokeWidth={1.3} />,
        );
      }
      shapes.push(
        <path key={`shine-a-${dx}`} d={arc(x, cy, 29.5, 300, 338)} fill="none" stroke={groove} strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" />,
        <path key={`shine-b-${dx}`} d={arc(x, cy, 29.5, 120, 158)} fill="none" stroke={groove} strokeOpacity={0.35} strokeWidth={2.4} strokeLinecap="round" />,
      );
    }
    shapes.push(
      <circle key={`label-${dx}`} cx={x} cy={cy} r={14} fill={RED} />,
      <circle key={`hole-${dx}`} cx={x} cy={cy} r={2.8} fill={groove} />,
    );
    return shapes;
  });
}
