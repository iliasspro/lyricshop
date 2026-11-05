import type { CSSProperties } from "react";
import { curveRadius, displayText, estimateLineWidth, type Layer, type TextLayer } from "@/lib/design";
import { fontFor } from "@/lib/fonts";
import { graphicFor } from "@/lib/graphics";

type Props = {
  layer: Layer;
  /** print-area width / height in garment units */
  W: number;
  H: number;
  idPrefix: string;
};

export function layerTransform(layer: Layer, W: number, H: number): string {
  const flip = layer.flipX ? " scale(-1 1)" : "";
  return `translate(${round(layer.x * W)} ${round(layer.y * H)}) rotate(${round(layer.rotation)})${flip}`;
}

const round = (n: number) => Math.round(n * 100) / 100;

function textStyle(layer: TextLayer, fs: number): CSSProperties {
  const font = fontFor(layer.font);
  const style: CSSProperties = {
    fontFamily: `"${font.family}"`,
    fontWeight: font.weight,
    fontStyle: font.style,
    fontSize: fs,
    letterSpacing: `${layer.letterSpacing}em`,
    whiteSpace: "pre",
  };
  if (layer.strokeColor && layer.strokeWidth) {
    style.stroke = layer.strokeColor;
    style.strokeWidth = layer.strokeWidth * fs;
    style.paintOrder = "stroke";
    style.strokeLinejoin = "round";
  }
  return style;
}

function TextBody({ layer, W, idPrefix }: { layer: TextLayer; W: number; idPrefix: string }) {
  const fs = layer.size * W;
  const content = displayText(layer);
  const style = textStyle(layer, fs);
  const R = curveRadius(layer, W);

  if (R) {
    const up = layer.curve > 0;
    const a = Math.PI * 0.94;
    const sx = round(-R * Math.sin(a));
    const ex = round(R * Math.sin(a));
    const y = round(up ? R - R * Math.cos(a) : -(R - R * Math.cos(a)));
    const d = `M${sx} ${y}A${round(R)} ${round(R)} 0 1 ${up ? 1 : 0} ${ex} ${y}`;
    const pathId = `${idPrefix}-arc-${layer.id}`;
    return (
      <g transform={`translate(0 ${round(fs * 0.34)})`}>
        <path id={pathId} d={d} fill="none" />
        <text fill={layer.color} style={style}>
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {content.replace(/\n/g, " ")}
          </textPath>
        </text>
      </g>
    );
  }

  const lines = content.split("\n");
  const lh = layer.lineHeight * fs;
  const anchor = layer.align === "left" ? "start" : layer.align === "right" ? "end" : "middle";
  const maxW = Math.max(...lines.map((l) => estimateLineWidth(l, layer, W)));
  const x = layer.align === "left" ? -maxW / 2 : layer.align === "right" ? maxW / 2 : 0;
  return (
    <text fill={layer.color} style={style} textAnchor={anchor}>
      {lines.map((line, i) => (
        <tspan key={i} x={round(x)} y={round((i - (lines.length - 1) / 2) * lh)} dominantBaseline="central">
          {line || " "}
        </tspan>
      ))}
    </text>
  );
}

/** Renders a single print layer centred on its own origin (no position transform). */
export function LayerBody({ layer, W, idPrefix }: Omit<Props, "H">) {
  if (layer.type === "text") return <TextBody layer={layer} W={W} idPrefix={idPrefix} />;
  if (layer.type === "graphic") {
    const art = graphicFor(layer.graphic);
    const size = layer.size * W;
    const s = size / 100;
    return (
      <path
        d={art.d}
        fill={layer.color}
        fillRule={art.fillRule}
        transform={`translate(${round(-size / 2)} ${round(-size / 2)}) scale(${round(s * 1000) / 1000})`}
      />
    );
  }
  const w = layer.size * W;
  const h = w * layer.aspect;
  return (
    <image
      href={layer.src}
      x={round(-w / 2)}
      y={round(-h / 2)}
      width={round(w)}
      height={round(h)}
      preserveAspectRatio="none"
    />
  );
}

export function PrintLayer({ layer, W, H, idPrefix }: Props) {
  if (layer.hidden) return null;
  return (
    <g transform={layerTransform(layer, W, H)} opacity={layer.opacity} data-layer={layer.id}>
      <LayerBody layer={layer} W={W} idPrefix={idPrefix} />
    </g>
  );
}
