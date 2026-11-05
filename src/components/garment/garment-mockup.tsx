"use client";

import { useId, type ReactNode, type SVGProps } from "react";
import { luminance } from "@/lib/colors";
import { resolveLayers, type Layer } from "@/lib/design";
import { GARMENTS, type GarmentId, type GarmentView, type PrintArea } from "@/lib/garments";
import { PrintLayer } from "./print-layer";

type Props = {
  garment: GarmentId;
  color: string;
  view?: GarmentView;
  layers?: Layer[];
  className?: string;
  /** Dashed guide around the printable area. */
  showPrintArea?: boolean;
  shadow?: boolean;
  /** Elements drawn above the garment in print-area coordinates (Studio handles). */
  overlay?: (area: PrintArea) => ReactNode;
  svgProps?: SVGProps<SVGSVGElement>;
  title?: string;
};

export function GarmentMockup({
  garment,
  color,
  view = "front",
  layers = [],
  className,
  showPrintArea,
  shadow = true,
  overlay,
  svgProps,
  title,
}: Props) {
  const raw = useId();
  const id = `g${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const g = GARMENTS[garment];
  const shape = g.views[view] ?? g.views.front!;
  const pa = shape.printArea;

  const lum = luminance(color);
  const dark = Math.min(1, 0.5 + lum * 0.75); // shadows matter on light cloth
  const light = 0.35 + (1 - lum) * 0.55; // highlights carry dark cloth, but stay subtle
  const seam = lum > 0.5 ? `rgba(0,0,0,${0.2 * dark})` : `rgba(255,255,255,${0.1 * light})`;
  const seamDark = `rgba(0,0,0,${0.16 + 0.14 * lum})`;

  const unionPaths = [
    ...(shape.under ?? []),
    shape.body,
    ...(shape.trims ?? []),
    ...(shape.over ?? []),
  ];

  return (
    <svg
      viewBox={g.viewBox ?? "0 0 1000 1000"}
      className={className}
      role="img"
      aria-label={title ?? `${g.name} mockup`}
      {...svgProps}
    >
      <defs>
        <clipPath id={`${id}-cloth`}>
          {unionPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <clipPath id={`${id}-print`}>
          <rect x={pa.x} y={pa.y} width={pa.w} height={pa.h} />
        </clipPath>
        <linearGradient id={`${id}-side`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={0.26 * dark} />
          <stop offset="0.2" stopColor="#000" stopOpacity="0" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={0.26 * dark} />
        </linearGradient>
        <linearGradient id={`${id}-vert`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.08 * light} />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.82" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={0.18 * dark} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.42" cy="0.32" r="0.55">
          <stop offset="0" stopColor="#fff" stopOpacity={0.13 * light} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-rib`} width="7" height="40" patternUnits="userSpaceOnUse">
          <rect width="2" height="40" fill="#000" opacity={0.13 * dark} />
          <rect x="3" width="1.2" height="40" fill="#fff" opacity={0.06 * light} />
        </pattern>
        <pattern id={`${id}-noise`} width="160" height="160" patternUnits="userSpaceOnUse">
          <image href="/textures/noise.png" width="160" height="160" />
        </pattern>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <filter id={`${id}-shadow`} x="-30%" y="-300%" width="160%" height="700%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {shadow && (
        <ellipse
          cx={shape.shadow.cx}
          cy={shape.shadow.cy}
          rx={shape.shadow.rx}
          ry={shape.shadow.ry}
          fill="#000"
          opacity={0.28}
          filter={`url(#${id}-shadow)`}
        />
      )}

      {/* back straps (tote) */}
      {shape.straps
        ?.filter((s) => s.back)
        .map((s, i) => (
          <g key={`bs${i}`}>
            <path d={s.d} fill="none" stroke={seamDark} strokeWidth={38} />
            <path d={s.d} fill="none" stroke={color} strokeWidth={34} />
            <path d={s.d} fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={34} />
          </g>
        ))}

      {/* under layers, e.g. the back of the hood */}
      {shape.under?.map((d, i) => (
        <g key={`u${i}`}>
          <path d={d} fill={color} />
          <path d={d} fill="#000" opacity={0.16 * dark + 0.04} />
        </g>
      ))}

      <path d={shape.body} fill={color} />

      {shape.inner?.map((d, i) => (
        <g key={`i${i}`}>
          <path d={d} fill={color} />
          <path d={d} fill="#000" opacity={0.42} />
          <path d={d} fill={`url(#${id}-side)`} />
        </g>
      ))}

      {shape.label && (
        <g>
          <rect {...pick(shape.label)} rx={2} fill="#EFE8DB" />
          <circle cx={shape.label.x + shape.label.w / 2} cy={shape.label.y + shape.label.h / 2} r={3} fill="#FF4A1C" />
        </g>
      )}

      {shape.trims?.map((d, i) => (
        <g key={`t${i}`}>
          <path d={d} fill={color} />
          <path d={d} fill={`url(#${id}-rib)`} />
          <path d={d} fill="none" stroke={seamDark} strokeWidth={2} />
        </g>
      ))}

      {shape.over?.map((d, i) => (
        <g key={`o${i}`}>
          <path d={d} fill={color} />
          <path d={d} fill="none" stroke={seamDark} strokeWidth={2.2} />
        </g>
      ))}

      {shape.lining?.map((d, i) => (
        <g key={`ln${i}`}>
          <path d={d} fill={color} />
          <path d={d} fill="#000" opacity={0.38} />
          <path d={d} fill={`url(#${id}-side)`} />
          <path d={d} fill="none" stroke={seamDark} strokeWidth={2.2} />
        </g>
      ))}

      {/* the print */}
      <g clipPath={`url(#${id}-print)`} opacity={0.97}>
        <g transform={`translate(${pa.x} ${pa.y})`} data-print-layers="">
          {resolveLayers(layers, color).map((layer) => (
            <PrintLayer key={layer.id} layer={layer} W={pa.w} H={pa.h} idPrefix={id} />
          ))}
        </g>
      </g>

      {/* cloth shading over everything, print included */}
      <g clipPath={`url(#${id}-cloth)`} style={{ pointerEvents: "none" }}>
        <rect x="0" y="0" width="1000" height="1000" fill={`url(#${id}-side)`} />
        <rect x="0" y="0" width="1000" height="1000" fill={`url(#${id}-vert)`} />
        <rect x="0" y="0" width="1000" height="1000" fill={`url(#${id}-glow)`} />
        <g filter={`url(#${id}-soft)`}>
          {shape.folds?.map((f, i) => (
            <path
              key={i}
              d={f.d}
              fill="none"
              stroke={f.tone === "dark" ? "#000" : "#fff"}
              strokeOpacity={f.opacity * (f.tone === "dark" ? dark : light)}
              strokeWidth={f.width}
              strokeLinecap="round"
            />
          ))}
        </g>
        <rect x="0" y="0" width="1000" height="1000" fill={`url(#${id}-noise)`} opacity={0.55} />
      </g>

      <g fill="none" style={{ pointerEvents: "none" }}>
        {shape.seams?.map((d, i) => (
          <path key={`s${i}`} d={d} stroke={seamDark} strokeWidth={2.2} strokeLinecap="round" />
        ))}
        {shape.stitches?.map((d, i) => (
          <path key={`st${i}`} d={d} stroke={seam} strokeWidth={2} strokeDasharray="7 6" strokeLinecap="round" />
        ))}
      </g>

      {/* front straps (tote) */}
      {shape.straps
        ?.filter((s) => !s.back)
        .map((s, i) => (
          <g key={`fs${i}`} style={{ pointerEvents: "none" }}>
            <path d={s.d} fill="none" stroke={seamDark} strokeWidth={38} />
            <path d={s.d} fill="none" stroke={color} strokeWidth={34} />
            <path d={s.d} fill="none" stroke={seam} strokeWidth={1.8} strokeDasharray="7 6" transform="translate(-10 0)" />
            <path d={s.d} fill="none" stroke={seam} strokeWidth={1.8} strokeDasharray="7 6" transform="translate(10 0)" />
          </g>
        ))}

      {shape.button && (
        <g>
          <circle cx={shape.button.cx} cy={shape.button.cy} r={shape.button.r} fill={color} />
          <circle cx={shape.button.cx} cy={shape.button.cy} r={shape.button.r} fill="#000" opacity={0.18} />
          <circle cx={shape.button.cx} cy={shape.button.cy} r={shape.button.r} fill="none" stroke={seamDark} strokeWidth={2} />
        </g>
      )}

      {shape.eyelets?.map(([x, y], i) => (
        <g key={`e${i}`}>
          <circle cx={x} cy={y} r={8} fill="#000" opacity={0.45} />
          <circle cx={x} cy={y} r={8} fill="none" stroke="#c9c5bd" strokeWidth={2.5} />
        </g>
      ))}

      {shape.cords?.map((c, i) => (
        <g key={`c${i}`} style={{ pointerEvents: "none" }}>
          <path d={c.d} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={12} strokeLinecap="round" />
          <path d={c.d} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
          <path d={c.d} fill="none" stroke="#fff" strokeOpacity={0.12 * light} strokeWidth={3} strokeLinecap="round" />
          <line
            x1={c.end[0]}
            y1={c.end[1]}
            x2={c.end[0] - 1}
            y2={c.end[1] + 28}
            stroke="#a8a49c"
            strokeWidth={11}
            strokeLinecap="round"
          />
        </g>
      ))}

      {showPrintArea && (
        <rect
          data-export-ignore=""
          x={pa.x}
          y={pa.y}
          width={pa.w}
          height={pa.h}
          fill="none"
          stroke={lum > 0.4 ? "rgba(15,14,13,.35)" : "rgba(243,238,229,.4)"}
          strokeWidth={2}
          strokeDasharray="10 8"
          style={{ pointerEvents: "none" }}
        />
      )}

      {overlay && (
        <g transform={`translate(${pa.x} ${pa.y})`} data-export-ignore="">
          {overlay(pa)}
        </g>
      )}
    </svg>
  );
}

function pick(r: { x: number; y: number; w: number; h: number }) {
  return { x: r.x, y: r.y, width: r.w, height: r.h };
}
