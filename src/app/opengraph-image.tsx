import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { MARK, WORDMARK } from "@/components/brand/logo-data";
import { markShapes } from "@/components/info/mark-shapes";

export const alt = "Lyricshop: Wear your words. Lyric-driven streetwear by independent artists.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0F0E0D";
const BONE = "#F3EEE5";
const RED = "#FF4A1C";

// Local font files never change between requests, so read them once at module scope.
const [extraBold, bold] = await Promise.all([
  readFile(join(process.cwd(), "scripts/fonts/BricolageGrotesque-ExtraBold.ttf")),
  readFile(join(process.cwd(), "scripts/fonts/BricolageGrotesque-Bold.ttf")),
]);

const WORD_W = 250;
const WORD_H = Math.round((WORD_W * 105) / 403);
const MARK_W = 340;
const MARK_H = Math.round((MARK_W * 120) / 178);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: INK,
          backgroundImage: "radial-gradient(circle at 84% 30%, rgba(255,74,28,0.16), rgba(15,14,13,0) 42%)",
          color: BONE,
          fontFamily: "Bricolage",
        }}
      >
        <svg
          width={WORD_W}
          height={WORD_H}
          viewBox={WORDMARK.viewBox}
          style={{ position: "absolute", left: 72, top: 70 }}
        >
          <path d={WORDMARK.d} fill={BONE} />
          <circle cx={WORDMARK.dot.cx} cy={WORDMARK.dot.cy} r={WORDMARK.dot.r} fill={RED} />
        </svg>

        <svg width={MARK_W} height={MARK_H} viewBox={MARK.viewBox} style={{ position: "absolute", right: 64, top: 58 }}>
          {markShapes("bone")}
        </svg>

        <div
          style={{
            position: "absolute",
            left: 66,
            bottom: 58,
            display: "flex",
            flexDirection: "column",
            fontSize: 152,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.045em",
          }}
        >
          <span>Wear your</span>
          <span style={{ color: RED }}>words.</span>
        </div>

        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 74,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            fontSize: 27,
            fontWeight: 700,
            lineHeight: 1.25,
            color: "rgba(243,238,229,0.62)",
          }}
        >
          <span>Lyric-driven streetwear</span>
          <span>by independent artists.</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: extraBold, weight: 800, style: "normal" },
        { name: "Bricolage", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
