import { ImageResponse } from "next/og";
import { MARK } from "@/components/brand/logo-data";
import { markShapes } from "@/components/info/mark-shapes";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK_W = 132;
const MARK_H = Math.round((MARK_W * 120) / 178);

// Bone records on an ink tile, matching src/app/icon.svg.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F0E0D",
          borderRadius: 40,
        }}
      >
        <svg width={MARK_W} height={MARK_H} viewBox={MARK.viewBox} style={{ marginTop: 4 }}>
          {markShapes("bone")}
        </svg>
      </div>
    ),
    { ...size },
  );
}
