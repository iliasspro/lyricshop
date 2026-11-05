import { ArrowDown, ArrowRight, ArrowUpRight, Check, Download, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { statSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import { Logo, Mark, Wordmark } from "@/components/brand/logo";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { LockupClearSpace, MarkClearSpace, MarkConstruction, WordmarkAnatomy } from "@/components/info/brand-diagrams";
import { BrandMisuse } from "@/components/info/brand-misuse";
import { FontSpecimens } from "@/components/info/font-specimens";
import { Palette } from "@/components/info/palette";
import { RecordPlayer } from "@/components/info/record-player";
import { SectionNav } from "@/components/info/section-nav";
import { Eyebrow, SectionHeading } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { colorFor, luminance } from "@/lib/colors";
import { CREATOR_BY_HANDLE } from "@/lib/data/creators";
import { getProduct } from "@/lib/data/products";
import type { GarmentView } from "@/lib/garments";

export const metadata: Metadata = {
  title: "Brand & logo",
  description:
    "The Lyricshop identity: a quotation mark made of two records, the lowercase wordmark, On-Air Red, type, voice, photography and print guidance, plus SVG logo downloads.",
};

const SECTIONS = [
  { id: "logo", label: "The mark" },
  { id: "lockups", label: "Lockups" },
  { id: "clear-space", label: "Space & size" },
  { id: "misuse", label: "Misuse" },
  { id: "motion", label: "Motion" },
  { id: "color", label: "Color" },
  { id: "type", label: "Type" },
  { id: "voice", label: "Voice" },
  { id: "photography", label: "Photography" },
  { id: "print", label: "Print" },
  { id: "downloads", label: "Downloads" },
];

// ---------------------------------------------------------------------------
// Logo files in /public/brand (built by scripts/build-brand.mjs)
// ---------------------------------------------------------------------------
type BrandFile = { file: string; name: string; note: string; surface: "bone" | "ink"; preview: ReactNode };

function fileSize(file: string): string | null {
  try {
    const bytes = statSync(join(process.cwd(), "public/brand", file)).size;
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  } catch {
    return null;
  }
}

const FILES: BrandFile[] = [
  { file: "lyricshop-logo.svg", name: "Primary lockup", note: "Ink, for bone, paper and light cloth", surface: "bone", preview: <Logo className="h-auto w-full" /> },
  { file: "lyricshop-logo-bone.svg", name: "Reverse lockup", note: "Bone, for ink, photos and dark cloth", surface: "ink", preview: <Logo tone="bone" className="h-auto w-full" /> },
  { file: "lyricshop-mark.svg", name: "Mark", note: "Ink records on light backgrounds", surface: "bone", preview: <Mark className="mx-auto h-10 w-auto" /> },
  { file: "lyricshop-mark-bone.svg", name: "Mark, reversed", note: "Bone records on dark backgrounds", surface: "ink", preview: <Mark tone="bone" className="mx-auto h-10 w-auto" /> },
  { file: "lyricshop-wordmark.svg", name: "Wordmark", note: "Ink, when the mark is already nearby", surface: "bone", preview: <Wordmark className="h-auto w-full" /> },
  { file: "lyricshop-wordmark-bone.svg", name: "Wordmark, reversed", note: "Bone, for dark backgrounds", surface: "ink", preview: <Wordmark tone="bone" className="h-auto w-full" /> },
  {
    file: "lyricshop-badge.svg",
    name: "Record-label badge",
    note: "Hang tags, stickers, the back of the neck",
    surface: "bone",
    preview: <Image src="/brand/lyricshop-badge.svg" alt="" width={48} height={48} unoptimized className="mx-auto size-12" />,
  },
];

const SIZES = Object.fromEntries(FILES.map((f) => [f.file, fileSize(f.file)]));

function DownloadChip({ file, label, tone = "ink" }: { file: string; label: string; tone?: "ink" | "bone" }) {
  return (
    <a
      href={`/brand/${file}`}
      download={file}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
        tone === "bone"
          ? "border-bone/20 text-bone/80 hover:border-bone hover:bg-bone hover:text-ink"
          : "border-ink/15 text-ink/80 hover:border-ink hover:bg-ink hover:text-bone",
      )}
    >
      <Download className="size-3.5" aria-hidden />
      {label}
      <span className="sr-only"> ({file})</span>
    </a>
  );
}

function LockupCard({
  title,
  note,
  surface,
  className,
  children,
  downloads,
}: {
  title: string;
  note: string;
  surface: "bone" | "ink";
  className?: string;
  children: ReactNode;
  downloads: { file: string; label: string; tone?: "ink" | "bone" }[];
}) {
  const dark = surface === "ink";
  return (
    <figure className={cn("flex flex-col overflow-hidden rounded-[28px]", dark ? "bg-ink text-bone" : "bg-bone", className)}>
      <div className="flex min-h-[240px] flex-1 items-center justify-center">{children}</div>
      <figcaption
        className={cn(
          "flex flex-wrap items-end justify-between gap-4 border-t p-5 md:px-7",
          dark ? "border-bone/10" : "border-ink/8",
        )}
      >
        <div>
          <p className="font-medium">{title}</p>
          <p className={cn("mt-1 text-sm", dark ? "text-bone/55" : "text-smoke")}>{note}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {downloads.map((d) => (
            <DownloadChip key={d.file} file={d.file} label={d.label} tone={d.tone ?? (dark ? "bone" : "ink")} />
          ))}
        </div>
      </figcaption>
    </figure>
  );
}

const WILD = [
  {
    src: "/images/brand-packaging.jpg",
    title: "Mailer, seal and hang tag",
    note: "Reverse lockup on the ink mailer, the mark on a kraft tag and a red record-mark sticker sealing the tissue.",
    alt: "A black Lyricshop mailer box above an open kraft box holding a folded black hoodie in tissue, sealed with a red Lyricshop sticker, next to a kraft hang tag with the mark",
    pos: "50% 50%",
    cls: "lg:col-span-8",
    frame: "aspect-[4/3] lg:aspect-auto lg:h-[560px]",
    sizes: "(min-width: 1024px) 66vw, 100vw",
  },
  {
    src: "/images/brand-bag.jpg",
    title: "The shopping bag",
    note: "Primary lockup on a bone paper bag. One logo, centered, lots of room.",
    alt: "A person walking down a sunny city sidewalk carrying a bone shopping bag printed with the Lyricshop logo",
    pos: "50% 62%",
    cls: "lg:col-span-4",
    frame: "aspect-[4/5] lg:aspect-auto lg:h-[560px]",
    sizes: "(min-width: 1024px) 33vw, 100vw",
  },
];

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const PAIRS = [
  { fg: "#0F0E0D", bg: "#F3EEE5", label: "Ink on bone", use: "Everything you read." },
  { fg: "#F3EEE5", bg: "#0F0E0D", label: "Bone on ink", use: "Night sections and the footer." },
  { fg: "#FF4A1C", bg: "#0F0E0D", label: "Red on ink", use: "The accent word, at any size." },
  { fg: "#0F0E0D", bg: "#FF4A1C", label: "Ink on red", use: "Buttons, badges, the dot." },
  { fg: "#6B645D", bg: "#F3EEE5", label: "Smoke on bone", use: "Captions and secondary text." },
  { fg: "#0F0E0D", bg: "#F5D547", label: "Ink on tape", use: "Highlights and limited tags." },
  { fg: "#FF4A1C", bg: "#F3EEE5", label: "Red on bone", use: "Shapes only: dots, records, rules." },
];

const grade = (r: number) => (r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large" : "Graphics only");

const MIX = [
  { name: "Bone", hex: "#F3EEE5", share: 48 },
  { name: "Ink", hex: "#0F0E0D", share: 26 },
  { name: "Paper", hex: "#EAE3D7", share: 14 },
  { name: "Sand & smoke", hex: "#D9D0C1", share: 7 },
  { name: "Red", hex: "#FF4A1C", share: 4 },
  { name: "Tape", hex: "#F5D547", share: 1 },
];

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------
const SCALE = [
  { name: "Display XL", spec: "clamp(3.2rem, 8vw, 8rem) · 800 · −3.5%", sample: "Loud hearted.", cls: "display text-[clamp(2.4rem,5vw,4.6rem)]" },
  { name: "Display L", spec: "clamp(2.2rem, 5vw, 4.4rem) · 800", sample: "Lines worth repeating", cls: "display text-[clamp(1.8rem,3.4vw,3rem)]" },
  { name: "Title", spec: "1.5rem · 500 · −1%", sample: "Real songwriters, real royalties", cls: "text-2xl font-medium tracking-[-0.01em]" },
  { name: "Body", spec: "1.125rem / 1rem · 400 · 1.6", sample: "Every piece is a line by an independent artist.", cls: "text-lg" },
  { name: "Eyebrow", spec: "0.7rem mono · 0.14em · uppercase", sample: "Fall ’26 campaign", cls: "eyebrow" },
];

// ---------------------------------------------------------------------------
// Voice
// ---------------------------------------------------------------------------
const PRINCIPLES = [
  { title: "Credit the writer.", body: "Name the artist every time. It's their line; we just print it." },
  { title: "Say less, mean it.", body: "Short sentences, one idea each. Cut the adjective you added to sound premium." },
  { title: "Music-literate, never gatekept.", body: "B-sides, dead wax, one more take: references that let people in, not test them." },
  { title: "No borrowed lines.", body: "We never quote or print lyrics we don't have the rights to. Not in copy, not as a joke." },
];

const PAIRS_VOICE = [
  {
    where: "Product copy",
    yes: "Maya's handwriting, printed small over the heart. A quiet one.",
    no: "Elevate your look with this must-have premium statement crewneck.",
  },
  {
    where: "Order update",
    yes: "It's on the press. Your hoodie ships Thursday.",
    no: "Your order has been successfully processed by our fulfillment system.",
  },
  {
    where: "Artist credit",
    yes: "Written by Dev Raman. He keeps 30% of this sale.",
    no: "Featuring licensed content from one of our creators.",
  },
  {
    where: "Scarcity",
    yes: "Last run of the season. After that, it lives in the archive.",
    no: "HURRY!!! ONLY 2 LEFT. DON'T MISS OUT!!!",
  },
  {
    where: "Errors",
    yes: "That page skipped. Let's get you back to the record.",
    no: "Error 404: the requested resource could not be found.",
  },
];

const WORDS = [
  ["line", "content"],
  ["artist, songwriter", "creator, vendor"],
  ["piece", "item, SKU"],
  ["printed to order", "made on demand"],
  ["bag", "cart"],
  ["drop", "launch event"],
];

// ---------------------------------------------------------------------------
// Photography
// ---------------------------------------------------------------------------
const PHOTOS = [
  {
    src: "/images/campaign-rooftop.jpg",
    place: "Rooftop, blue hour",
    line: "Friends, not models.",
    alt: "Three friends laughing on a city rooftop at dusk, one in a Loud Hearted hoodie",
    pos: "50% 60%",
    cls: "aspect-[16/10] md:col-span-8 md:aspect-auto",
  },
  {
    src: "/images/collection-night-shift.jpg",
    place: "Street, 3 a.m.",
    line: "Let the neon do the talking.",
    alt: "A woman in a black No Skips hoodie on a wet street lit by red neon",
    pos: "50% 30%",
    cls: "aspect-[3/4] md:col-span-4 md:row-span-2 md:aspect-auto",
  },
  {
    src: "/images/store-interior.jpg",
    place: "The shop floor",
    line: "Our sign belongs in frame.",
    alt: "A clothing and record shop interior with a red lyricshop neon sign on the back wall",
    pos: "60% 50%",
    cls: "aspect-[16/10] md:col-span-5 md:aspect-auto",
  },
  {
    src: "/images/collection-paper-hearts.jpg",
    place: "Bedroom, morning",
    line: "Quiet lines, window light.",
    alt: "A young man in a cream crewneck sitting on a wooden floor by the window with a notebook",
    pos: "50% 32%",
    cls: "aspect-[3/4] md:col-span-3 md:aspect-auto",
  },
];

const PHOTO_STRIP = [
  {
    src: "/images/collection-basement-tapes.jpg",
    place: "Rehearsal basement",
    line: "Amps, string lights, one more take.",
    alt: "A guitarist in a faded One More Take tee standing in a basement rehearsal space",
  },
  {
    src: "/images/lookbook-b-side.jpg",
    place: "Laundromat",
    line: "Mid-laugh beats mid-pose.",
    alt: "A woman laughing in a laundromat wearing a cream B-Side hoodie",
  },
  {
    src: "/images/lookbook-liner-notes.jpg",
    place: "The last train home",
    line: "Real people, real light.",
    alt: "A smiling older man in a black Liner Notes tee on a subway train",
  },
];

const SHOOT = [
  { title: "Real places", body: "Rooftops, basements, laundromats, record shops, the last train home. Wherever music actually happens." },
  { title: "Light with a mood", body: "Blue hour, neon, window light. Flat studio white is for product shots only." },
  { title: "The line reads first", body: "Frame so the print is legible. If you can't read the lyric, it's a different photo." },
  { title: "People mid-moment", body: "Laughing, listening, looking away. Never posing at the lens." },
  { title: "Grain, not gloss", body: "Shoot like film: real skin, warm shadows, honest grain. No heavy retouching." },
];

// ---------------------------------------------------------------------------
// Print
// ---------------------------------------------------------------------------
const PRINTS: { slug: string; view: GarmentView; color: string; label: string; note: string }[] = [
  { slug: "wear-your-words-tee", view: "front", color: "black", label: "The headline", note: "Center chest, big and blocky. One line, one face, edge to edge of the print area." },
  { slug: "say-it-back-hoodie", view: "back", color: "red", label: "The chorus", note: "Full back. A whisper on the chest, the punchline behind you in giant condensed type." },
  { slug: "hum-it-back-crewneck", view: "front", color: "sand", label: "The whisper", note: "Small and high on the chest. Handwriting for the lines you'd only write in a notebook." },
];

const PRINT_RULES = [
  { title: "Break where the singer breathes.", body: "Line breaks follow the phrasing of the song, not the width of the box." },
  { title: "One face. Two at most.", body: "Pair a loud face with a quiet one, never two loud ones." },
  { title: "Ink follows the cloth.", body: "Bone ink on dark cloth, ink on light. On-Air Red reads best on black and bone." },
  { title: "Stay inside the lines.", body: "Keep type within the dashed print area and give the collar room to breathe." },
  { title: "Credit the writer.", body: "Name the person who wrote the line: on the product page, and on the neck print where there's room." },
  { title: "Soft hand first.", body: "Water-based ink by default; puff or plastisol only when the line needs to stand up." },
];

function Photo({
  src,
  alt,
  place,
  line,
  pos,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  place: string;
  line: string;
  pos?: string;
  sizes: string;
  className?: string;
}) {
  return (
    <figure className={cn("group/photo relative isolate overflow-hidden rounded-[24px]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="-z-10 object-cover transition duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/photo:scale-[1.03]"
        style={pos ? { objectPosition: pos } : undefined}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/5 via-30% to-transparent" />
      <figcaption className="flex h-full flex-col justify-end p-5 md:p-6">
        <p className="eyebrow text-bone/60">{place}</p>
        <p className="serif-italic mt-1 text-2xl">{line}</p>
      </figcaption>
    </figure>
  );
}

export default function BrandPage() {
  return (
    <>
      {/* Hero */}
      <section className="container-page grid gap-10 pb-16 pt-10 md:pt-14 lg:grid-cols-12 lg:items-end lg:gap-12 lg:pb-20">
        <div className="lg:col-span-7">
          <Eyebrow dot className="text-smoke">
            Brand guidelines · The Lyricshop identity
          </Eyebrow>
          <h1 className="display mt-6 text-[clamp(3.4rem,8.6vw,8.5rem)]">
            Lyrics live between <span className="serif-italic font-normal">quotes.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-smoke">
            Everything that makes Lyricshop look and sound like Lyricshop: the mark, the wordmark, color, type, voice and how a
            line lands on a garment. For artists, press, collaborators and whoever designs the next drop.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="#downloads" size="lg">
              Download the logo <ArrowDown className="size-4" />
            </ButtonLink>
            <ButtonLink href="/about" variant="outline" size="lg">
              Read our story
            </ButtonLink>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="grain relative flex aspect-square flex-col overflow-hidden rounded-[32px] bg-ink p-6 text-bone md:p-8">
            <div className="eyebrow relative z-10 flex justify-between text-bone/45">
              <span>Fig. 01 — The mark</span>
              <span className="max-md:hidden">Hover to play</span>
            </div>
            <div className="relative z-10 flex flex-1 items-center">
              <RecordPlayer tone="bone" className="w-full" markClassName="h-auto w-[76%]" />
            </div>
            <p className="relative z-10 serif-italic text-2xl text-bone/80">Two records, one opening quote.</p>
          </div>
        </div>
      </section>

      <SectionNav links={SECTIONS} variant="bar" label="Brand guidelines sections" />

      {/* Spec strip */}
      <dl className="container-page grid grid-cols-2 border-b border-ink/10 md:grid-cols-4">
        {[
          ["Mark", "An opening quote, two records"],
          ["Wordmark", "Bricolage Grotesque ExtraBold"],
          ["Accent", "On-Air Red · #FF4A1C"],
          ["Voice", "Warm, specific, credited"],
        ].map(([k, v], i) => (
          <div key={k} className={cn("py-6 md:py-8", i % 2 === 1 && "pl-6 max-md:border-l max-md:border-ink/10", i > 0 && "md:border-l md:border-ink/10 md:pl-6", i > 1 && "max-md:border-t max-md:border-ink/10")}>
            <dt className="eyebrow text-smoke">{k}</dt>
            <dd className="mt-2 font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      {/* 01 — The mark */}
      <section id="logo" className="container-page scroll-mt-18 py-24 md:py-32">
        <SectionHeading
          eyebrow="01 · The mark"
          title={
            <>
              An opening quote, pressed on <span className="serif-italic font-normal">vinyl.</span>
            </>
          }
          aside={
            <p className="max-w-sm text-smoke">
              A quotation mark says the words belong to someone. Ours is drawn as two records, because every line on our shelves
              was a song first.
            </p>
          }
          className="mb-12"
        />
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          <figure className="rounded-[28px] bg-paper p-5 md:p-10 lg:col-span-7">
            <MarkConstruction className="h-auto w-full" />
            <figcaption className="eyebrow mt-6 flex justify-between gap-4 text-smoke">
              <span>Fig. 02 — Construction</span>
              <span>Units on the mark grid</span>
            </figcaption>
          </figure>
          <ol className="flex flex-col gap-4 lg:col-span-5">
            {[
              {
                title: "The quote",
                body: "An opening quotation mark, never a closing one. The mark opens the line; whoever wears it finishes the sentence.",
              },
              {
                title: "The records",
                body: "Each ball of the quote is a record, grooves and all. Every lyric came from somewhere, and we say where.",
              },
              {
                title: "The on-air light",
                body: "The red label is the light above the studio door. When it's on, somebody means what they're saying.",
              },
            ].map((n, i) => (
              <li key={n.title} className="flex flex-1 gap-5 rounded-[24px] border border-ink/10 p-6">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-red font-mono text-sm text-ink">{i + 1}</span>
                <div>
                  <p className="display text-[1.7rem]">{n.title}</p>
                  <p className="mt-2 text-smoke">{n.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 grid gap-8 rounded-[28px] bg-paper p-6 md:p-10 lg:mt-5 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <Eyebrow className="text-smoke">The wordmark</Eyebrow>
            <p className="display mt-4 text-[clamp(1.9rem,3vw,2.6rem)]">
              Lowercase, heavy, <span className="serif-italic font-normal">one red light.</span>
            </p>
            <p className="mt-4 text-smoke">
              &ldquo;lyricshop&rdquo; is set in Bricolage Grotesque ExtraBold at display size, tracked tight, then outlined so it
              never depends on a font loading. The dot over the i is the on-air light from the mark: the only red in the name.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["lowercase", "Bricolage 800", "opsz 96", "outlined paths"].map((t) => (
                <li key={t} className="rounded-full border border-ink/12 px-3 py-1 font-mono text-[11px] text-smoke">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-8">
            <WordmarkAnatomy className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* 02 — Lockups */}
      <section id="lockups" className="scroll-mt-18 bg-paper py-24 md:py-32">
        <div className="container-page">
          <SectionHeading
            eyebrow="02 · Lockups"
            title={
              <>
                Ink on bone. <span className="serif-italic font-normal">Bone on ink.</span>
              </>
            }
            aside={
              <p className="max-w-sm text-smoke">
                Two colorways, four shapes. Use the full lockup wherever there&apos;s room, and let the mark carry it when there
                isn&apos;t.
              </p>
            }
            className="mb-12"
          />
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
            <LockupCard
              title="Primary lockup"
              note="The default. Headers, packaging, the first page of anything."
              surface="bone"
              className="lg:col-span-7"
              downloads={[{ file: "lyricshop-logo.svg", label: "SVG" }]}
            >
              <Logo className="h-auto w-[72%] max-w-[520px] py-16" />
            </LockupCard>
            <LockupCard
              title="Reverse lockup"
              note="For night sections, dark photos and black cloth."
              surface="ink"
              className="lg:col-span-5"
              downloads={[{ file: "lyricshop-logo-bone.svg", label: "SVG" }]}
            >
              <Logo tone="bone" className="h-auto w-[76%] py-16" />
            </LockupCard>
            <LockupCard
              title="Mark"
              note="Avatars, favicons, neck prints. Anywhere square."
              surface="bone"
              className="lg:col-span-4"
              downloads={[
                { file: "lyricshop-mark.svg", label: "Ink" },
                { file: "lyricshop-mark-bone.svg", label: "Bone" },
              ]}
            >
              <div className="grid w-full grid-cols-2 self-stretch">
                <div className="grid place-items-center p-8">
                  <Mark className="h-auto w-full max-w-[150px]" />
                </div>
                <div className="grid place-items-center bg-ink p-8">
                  <Mark tone="bone" className="h-auto w-full max-w-[150px]" />
                </div>
              </div>
            </LockupCard>
            <LockupCard
              title="Wordmark"
              note="When the mark is already nearby, or the space is long and thin."
              surface="bone"
              className="lg:col-span-5"
              downloads={[
                { file: "lyricshop-wordmark.svg", label: "Ink" },
                { file: "lyricshop-wordmark-bone.svg", label: "Bone" },
              ]}
            >
              <div className="grid w-full grid-rows-2 self-stretch">
                <div className="grid place-items-center px-10 py-8">
                  <Wordmark className="h-auto w-full max-w-[300px]" />
                </div>
                <div className="grid place-items-center bg-ink px-10 py-8">
                  <Wordmark tone="bone" className="h-auto w-full max-w-[300px]" />
                </div>
              </div>
            </LockupCard>
            <LockupCard
              title="Badge"
              note="The record-label seal for tags and stickers."
              surface="ink"
              className="lg:col-span-3"
              downloads={[{ file: "lyricshop-badge.svg", label: "SVG" }]}
            >
              <Image
                src="/brand/lyricshop-badge.svg"
                alt="The Lyricshop badge: the mark inside a record label ringed with the words Lyricshop, Wear your words and Made by artists"
                width={220}
                height={220}
                unoptimized
                className="my-10 h-auto w-[min(220px,62%)] animate-spin-slow hover:[animation-play-state:paused]"
              />
            </LockupCard>
          </div>

          {/* In the wild */}
          <div id="in-the-wild" className="scroll-mt-18 pt-24 md:pt-32">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div className="max-w-3xl">
                <Eyebrow className="mb-4 text-smoke">In the wild</Eyebrow>
                <h3 className="display text-[clamp(2rem,4vw,3.4rem)]">
                  Off the screen, <span className="serif-italic font-normal">onto the street.</span>
                </h3>
              </div>
              <p className="max-w-sm text-smoke">
                Ink box, bone bag, a record-mark sticker for a seal. The logo stays flat and calm; the cloth and the people do the
                talking.
              </p>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:gap-5">
              {WILD.map((w) => (
                <figure key={w.src} className={cn("flex flex-col overflow-hidden rounded-[28px] bg-bone", w.cls)}>
                  <div className={cn("relative overflow-hidden", w.frame)}>
                    <Image
                      src={w.src}
                      alt={w.alt}
                      fill
                      sizes={w.sizes}
                      className="object-cover transition duration-[1.2s] ease-[var(--ease-out-expo)] hover:scale-[1.03]"
                      style={{ objectPosition: w.pos }}
                    />
                  </div>
                  <figcaption className="flex flex-1 flex-col gap-1 p-5 md:px-7">
                    <p className="font-medium">{w.title}</p>
                    <p className="text-sm text-smoke">{w.note}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-6 flex items-center gap-2 px-1 text-sm text-smoke">
              <span className="size-1.5 shrink-0 rounded-full bg-red" aria-hidden />
              Both images were generated with Nano Banana Pro, using the actual Lyricshop logo files as the reference.
            </p>
          </div>
        </div>
      </section>

      {/* 03 — Clear space & minimum size */}
      <section id="clear-space" className="container-page scroll-mt-18 py-24 md:py-32">
        <SectionHeading
          eyebrow="03 · Clear space & size"
          title={
            <>
              Give it a <span className="serif-italic font-normal">bar&apos;s rest.</span>
            </>
          }
          aside={
            <p className="max-w-sm text-smoke">
              Clear space is measured in on-air dots: the red circle, at whatever size you&apos;re using the logo.
            </p>
          }
          className="mb-12"
        />
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          <figure className="flex flex-col rounded-[28px] bg-paper p-6 md:p-10 lg:col-span-7">
            <Eyebrow className="text-smoke">Clear space</Eyebrow>
            <div className="flex flex-1 items-center py-8">
              <LockupClearSpace className="h-auto w-full" />
            </div>
            <figcaption className="grid items-center gap-6 border-t border-ink/10 pt-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10">
              <MarkClearSpace className="h-36 w-auto max-sm:mx-auto" />
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Lockup & wordmark:</span>{" "}
                  <span className="text-smoke">two on-air dots of room on every side.</span>
                </p>
                <p>
                  <span className="font-medium">Mark alone:</span> <span className="text-smoke">one record label on every side.</span>
                </p>
                <p className="text-smoke">Nothing else enters the zone: no type, no edges, no other logos.</p>
              </div>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-5">
            <div className="flex-1 rounded-[28px] border border-ink/10 p-6 md:p-8">
              <Eyebrow className="text-smoke">Minimum size · lockup</Eyebrow>
              <div className="mt-8 flex flex-wrap items-end gap-x-7 gap-y-6">
                {[
                  { w: 168, label: "168 px" },
                  { w: 120, label: "120 px" },
                  { w: 96, label: "96 px · min", min: true },
                  { w: 64, label: "64 px", bad: true },
                ].map((s) => (
                  <div key={s.w} className="flex flex-col gap-3">
                    <div style={{ width: s.w }} className={cn(s.bad && "opacity-35")}>
                      <Logo className="h-auto w-full" />
                    </div>
                    <p className={cn("flex items-center gap-1.5 font-mono text-[11px]", s.min ? "text-ink" : "text-smoke")}>
                      {s.bad ? <X className="size-3 text-red" aria-label="Too small" /> : s.min ? <Check className="size-3 text-ok" aria-hidden /> : null}
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-smoke">96 px wide on screen, 25 mm in print.</p>
            </div>
            <div className="flex-1 rounded-[28px] border border-ink/10 p-6 md:p-8">
              <Eyebrow className="text-smoke">Minimum size · mark</Eyebrow>
              <div className="mt-8 flex flex-wrap items-end gap-x-7 gap-y-6">
                {[
                  { h: 56, label: "56 px" },
                  { h: 32, label: "32 px" },
                  { h: 20, label: "20 px · min", min: true },
                  { h: 13, label: "13 px", bad: true },
                ].map((s) => (
                  <div key={s.h} className="flex flex-col gap-3">
                    <div style={{ height: s.h }} className={cn(s.bad && "opacity-35")}>
                      <Mark detail={s.h >= 32} className="h-full w-auto" />
                    </div>
                    <p className={cn("flex items-center gap-1.5 font-mono text-[11px]", s.min ? "text-ink" : "text-smoke")}>
                      {s.bad ? <X className="size-3 text-red" aria-label="Too small" /> : s.min ? <Check className="size-3 text-ok" aria-hidden /> : null}
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-smoke">
                20 px tall on screen, 6 mm in print. Under 32 px the grooves drop out, just like the favicon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 04 — Misuse */}
      <section id="misuse" className="container-page scroll-mt-18 border-t border-ink/10 py-24 md:py-32">
        <SectionHeading
          eyebrow="04 · Misuse"
          title={
            <>
              Remix the clothes. <span className="serif-italic font-normal">Not the logo.</span>
            </>
          }
          aside={
            <p className="max-w-sm text-smoke">
              Colorways, typefaces and lines change with every drop. The logo stays exactly as it was recorded.
            </p>
          }
          className="mb-12"
        />
        <BrandMisuse />
      </section>

      {/* 05 — Motion */}
      <section id="motion" className="grain scroll-mt-18 bg-ink py-24 text-bone md:py-32">
        <div className="container-page relative z-10 grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-20">
          <div className="lg:col-span-6">
            <div className="flex aspect-square flex-col items-center justify-center rounded-[32px] border border-bone/10 bg-bone/[0.03] p-6">
              <RecordPlayer tone="bone" control hoverToPlay={false} className="w-full" markClassName="h-auto w-[70%]" />
            </div>
          </div>
          <div className="lg:col-span-6">
            <Eyebrow className="text-bone/50">05 · Motion</Eyebrow>
            <h2 className="display mt-5 text-[clamp(2.2rem,5vw,4.4rem)]">
              When something&apos;s happening, <span className="serif-italic font-normal text-red">the records turn.</span>
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {[
                { title: "Spin means progress", body: "Loading, pressing, sending. The records turn while something is happening, then stop." },
                { title: "One speed", body: "One turn every 2.4 seconds, linear. No easing, no wobble, no scratching." },
                { title: "Only the records move", body: "The tails hold still and the wordmark never spins." },
                { title: "Respect stillness", body: "With reduced motion switched on, the records stay put. Always." },
              ].map((r) => (
                <li key={r.title} className="border-t border-bone/12 pt-5">
                  <p className="font-medium">{r.title}</p>
                  <p className="mt-1.5 text-sm text-bone/60">{r.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <span className="inline-flex items-center gap-3 rounded-full bg-bone py-2 pl-2 pr-5 text-sm text-ink">
                <span className="grid size-9 place-items-center rounded-full bg-ink">
                  <Mark tone="bone" spin detail={false} className="h-4 w-auto" title="Loading" />
                </span>
                Pressing your order…
              </span>
              <span className="flex items-center gap-4 text-sm text-bone/60">
                <Image src="/brand/lyricshop-badge.svg" alt="" width={64} height={64} unoptimized className="size-16 animate-spin-slow" />
                <span className="max-w-[16rem]">The badge turns slower: one revolution every 14 seconds. Never behind text.</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — Color */}
      <section id="color" className="container-page scroll-mt-18 py-24 md:py-32">
        <SectionHeading
          eyebrow="06 · Color"
          title={
            <>
              Mostly bone and ink. <span className="serif-italic font-normal">One red light.</span>
            </>
          }
          aside={<p className="max-w-sm text-smoke">Click any swatch to copy its hex.</p>}
          className="mb-12"
        />
        <Palette />

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Eyebrow className="text-smoke">The mix</Eyebrow>
            <p className="display mt-4 text-[clamp(1.8rem,2.8vw,2.4rem)]">A page should feel like a record sleeve, not a billboard.</p>
            <div className="mt-8 flex h-16 overflow-hidden rounded-2xl ring-1 ring-ink/10" role="img" aria-label={`Rough color proportions: ${MIX.map((m) => `${m.name} ${m.share}%`).join(", ")}`}>
              {MIX.map((m) => (
                <div key={m.name} style={{ flexGrow: m.share, background: m.hex }} className="min-w-1" />
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              {MIX.map((m) => (
                <li key={m.name} className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full ring-1 ring-ink/15" style={{ background: m.hex }} />
                  {m.name}
                  <span className="font-mono text-[11px] text-smoke">~{m.share}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <Eyebrow className="text-smoke">Contrast pairs</Eyebrow>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {PAIRS.map((p) => {
                const r = contrast(p.fg, p.bg);
                const g = grade(r);
                return (
                  <li key={p.label} className="overflow-hidden rounded-[20px] ring-1 ring-ink/10">
                    <div className="flex h-24 items-end justify-between p-4" style={{ background: p.bg, color: p.fg }}>
                      <span className="display text-4xl">Aa</span>
                      <span className="font-mono text-xs">{r.toFixed(1)}:1</span>
                    </div>
                    <div className="bg-bone p-4">
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
                        <span className={cn("size-1.5 rounded-full", g === "Graphics only" ? "bg-red" : "bg-ok")} aria-hidden />
                        {g}
                      </p>
                      <p className="mt-2 text-xs text-smoke">{p.use}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* 07 — Type */}
      <section id="type" className="container-page scroll-mt-18 border-t border-ink/10 py-24 md:py-32">
        <SectionHeading
          eyebrow="07 · Typography"
          title={
            <>
              Loud headline, <span className="serif-italic font-normal">soft</span> aside.
            </>
          }
          aside={<p className="max-w-sm text-smoke">Four faces run the brand. Twenty-two more live on the garments.</p>}
          className="mb-12"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
          <article className="flex min-h-[360px] flex-col justify-between rounded-[28px] bg-ink p-7 text-bone md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-bone/45">Display</p>
                <p className="mt-2 text-lg">Bricolage Grotesque</p>
              </div>
              <span className="display text-6xl text-red">Aa</span>
            </div>
            <p className="display mt-10 text-[clamp(3rem,6vw,5.5rem)]">
              Wear your <span className="text-red">words.</span>
            </p>
            <p className="mt-8 border-t border-bone/12 pt-5 text-sm text-bone/60">
              ExtraBold 800 · optical size 96 · −3.5% tracking · 0.92 leading. Headlines, big numbers and the wordmark.
            </p>
          </article>
          <article className="flex min-h-[360px] flex-col justify-between rounded-[28px] bg-paper p-7 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-smoke">Expressive</p>
                <p className="mt-2 text-lg">Instrument Serif Italic</p>
              </div>
              <span className="serif-italic text-6xl">Aa</span>
            </div>
            <p className="serif-italic mt-10 text-[clamp(2.8rem,5.4vw,5rem)] leading-[0.95]">the word that feels it</p>
            <p className="mt-8 border-t border-ink/10 pt-5 text-sm text-smoke">
              Italic 400 · −1% tracking. One word per headline, pull quotes and captions with a pulse. Never a whole paragraph.
            </p>
          </article>
          <article className="flex flex-col justify-between rounded-[28px] bg-paper p-7 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-smoke">Interface</p>
                <p className="mt-2 text-lg">Geist</p>
              </div>
              <span className="text-6xl font-medium tracking-tight">Aa</span>
            </div>
            <p className="mt-10 max-w-md text-xl leading-relaxed">
              Printed to order on heavyweight organic cotton and shipped in three days. Every sale pays the person who wrote the line.
            </p>
            <p className="mt-8 border-t border-ink/10 pt-5 text-sm text-smoke">
              Regular 400 & Medium 500 · 15–18 px. Body copy, buttons, forms: anything you read in sentences.
            </p>
          </article>
          <article className="flex flex-col justify-between rounded-[28px] border border-ink/10 p-7 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-smoke">Labels</p>
                <p className="mt-2 text-lg">Geist Mono</p>
              </div>
              <span className="font-mono text-6xl tracking-tight">Aa</span>
            </div>
            <div className="mt-10 space-y-3">
              <p className="eyebrow">Side B · Track 04 · Night Shift</p>
              <p className="font-mono text-xl tabular-nums">$78.00 · #FF4A1C · 450 gsm</p>
            </div>
            <p className="mt-8 border-t border-ink/10 pt-5 text-sm text-smoke">
              Regular 400 · uppercase labels at 0.14em tracking. Eyebrows, prices, codes and hex values.
            </p>
          </article>
        </div>

        <div className="mt-4 overflow-hidden rounded-[28px] border border-ink/10 lg:mt-5">
          {SCALE.map((s, i) => (
            <div key={s.name} className={cn("grid items-baseline gap-2 px-6 py-6 md:grid-cols-[180px_minmax(0,1fr)_auto] md:gap-8 md:px-10", i > 0 && "border-t border-ink/10")}>
              <p className="eyebrow text-smoke">{s.name}</p>
              <p className={cn("min-w-0 truncate", s.cls)}>{s.sample}</p>
              <p className="font-mono text-[11px] text-smoke md:text-right">{s.spec}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 md:mt-32">
          <SectionHeading
            eyebrow="Garment typefaces"
            title={
              <>
                Twenty-two faces <span className="serif-italic font-normal">for the cloth.</span>
              </>
            }
            aside={
              <p className="max-w-sm text-smoke">
                Self-hosted, so catalog prints and Studio exports carry the exact same letters. Type a line to hear how each one says
                it.
              </p>
            }
            className="mb-10"
          />
          <FontSpecimens />
        </div>
      </section>

      {/* 08 — Voice */}
      <section id="voice" className="scroll-mt-18 bg-paper py-24 md:py-32">
        <div className="container-page">
          <SectionHeading
            eyebrow="08 · Voice & tone"
            title={
              <>
                Talk like <span className="serif-italic font-normal">liner notes.</span>
              </>
            }
            aside={
              <p className="max-w-sm text-smoke">
                Warm, specific and credited. We write like someone who loves the record and knows who played on it.
              </p>
            }
            className="mb-12"
          />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} className="rounded-[24px] bg-bone p-6">
                <p className="font-mono text-xs text-smoke">{String(i + 1).padStart(2, "0")}</p>
                <p className="display mt-6 text-[1.7rem]">{p.title}</p>
                <p className="mt-3 text-sm text-smoke">{p.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 overflow-hidden rounded-[28px] bg-bone">
            <div className="hidden grid-cols-[160px_1fr_1fr] gap-8 border-b border-ink/10 px-10 py-4 md:grid">
              <span className="eyebrow text-smoke">Where</span>
              <span className="eyebrow flex items-center gap-2">
                <Check className="size-3.5 text-ok" aria-hidden /> Say it like this
              </span>
              <span className="eyebrow flex items-center gap-2">
                <X className="size-3.5 text-red-deep" aria-hidden /> Not like this
              </span>
            </div>
            {PAIRS_VOICE.map((p, i) => (
              <div key={p.where} className={cn("grid gap-4 p-6 md:grid-cols-[160px_1fr_1fr] md:gap-8 md:px-10 md:py-7", i > 0 && "border-t border-ink/10")}>
                <p className="eyebrow pt-1 text-smoke">{p.where}</p>
                <p className="flex gap-3 text-lg">
                  <Check className="mt-1.5 size-4 shrink-0 text-ok md:hidden" aria-label="Do" />
                  <span>{p.yes}</span>
                </p>
                <p className="flex gap-3 text-smoke">
                  <X className="mt-1 size-4 shrink-0 text-red-deep md:hidden" aria-label="Don't" />
                  <s className="decoration-red/60">{p.no}</s>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow className="text-smoke">Our words</Eyebrow>
              <p className="display mt-4 text-[clamp(1.8rem,2.8vw,2.4rem)]">
                Small words, <span className="serif-italic font-normal">big difference.</span>
              </p>
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
              {WORDS.map(([yes, no]) => (
                <li key={yes} className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-4">
                  <span className="font-medium">{yes}</span>
                  <span className="text-right text-sm text-smoke">
                    not <s className="decoration-red/60">{no}</s>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 09 — Photography */}
      <section id="photography" className="scroll-mt-18 bg-ink py-24 text-bone md:py-32">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="max-w-3xl">
              <Eyebrow className="mb-4 text-bone/50">09 · Photography</Eyebrow>
              <h2 className="display text-[clamp(2.2rem,5vw,4.4rem)]">
                Shot where <span className="serif-italic font-normal text-red">music happens.</span>
              </h2>
            </div>
            <p className="max-w-sm text-bone/60">
              Rooftops, basements, laundromats, the last train home. Real places, real light, and the line readable in frame.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:auto-rows-[280px] md:grid-cols-12 md:gap-5 lg:auto-rows-[320px]">
            {PHOTOS.map((p) => (
              <Photo key={p.src} {...p} className={p.cls} sizes="(min-width: 768px) 60vw, 100vw" />
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 md:mt-5 md:gap-5">
            {PHOTO_STRIP.map((p) => (
              <Photo key={p.src} {...p} className="aspect-[4/5]" sizes="(min-width: 640px) 33vw, 100vw" />
            ))}
          </div>

          <ol className="mt-14 grid gap-x-8 gap-y-8 border-t border-bone/12 pt-10 sm:grid-cols-2 lg:grid-cols-5">
            {SHOOT.map((s, i) => (
              <li key={s.title}>
                <p className="font-mono text-xs text-red">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-3 font-medium">{s.title}</p>
                <p className="mt-1.5 text-sm text-bone/60">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 flex items-center gap-2 text-sm text-bone/45">
            <span className="size-1.5 shrink-0 rounded-full bg-red" aria-hidden />
            These reference frames were generated with Nano Banana Pro. Treat them as a mood board, then shoot the real thing.
          </p>
        </div>
      </section>

      {/* 10 — Print */}
      <section id="print" className="container-page scroll-mt-18 py-24 md:py-32">
        <SectionHeading
          eyebrow="10 · On the garment"
          title={
            <>
              The line <span className="serif-italic font-normal">is</span> the graphic.
            </>
          }
          aside={
            <p className="max-w-sm text-smoke">
              Most of our pieces are one line, one typeface, one ink. Here&apos;s how to set it so it reads from across the room.
            </p>
          }
          className="mb-12"
        />
        <div className="grid gap-4 md:grid-cols-3 lg:gap-5">
          {PRINTS.map((p) => {
            const product = getProduct(p.slug);
            if (!product) return null;
            const cloth = colorFor(p.color);
            const writer = CREATOR_BY_HANDLE[product.creator]?.name;
            return (
              <Link key={p.slug} href={`/product/${p.slug}`} className="group/print flex flex-col rounded-[28px] bg-paper p-4 md:p-5">
                <div className="relative rounded-[22px] bg-[#e5ddcf] p-3">
                  <GarmentMockup
                    garment={product.garment}
                    color={cloth.hex}
                    view={p.view}
                    layers={product.design[p.view]}
                    showPrintArea
                    className="h-auto w-full transition duration-700 ease-[var(--ease-out-expo)] group-hover/print:scale-[1.02]"
                    title={`${product.title} in ${cloth.name}, ${p.view}, with the print area outlined`}
                  />
                  <span className="eyebrow absolute left-4 top-4 rounded-full bg-bone/85 px-2.5 py-1 !text-[10px] backdrop-blur">
                    {p.view === "back" ? "Back" : "Front"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                  <p className="display text-[1.9rem]">{p.label}</p>
                  <p className="mt-2 text-smoke">{p.note}</p>
                  <p className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm">
                    <span>
                      {product.title}
                      {writer && <span className="text-smoke"> · {writer}</span>}
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 transition group-hover/print:-translate-y-0.5 group-hover/print:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        <ul className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {PRINT_RULES.map((r) => (
            <li key={r.title} className="flex gap-4 border-t border-ink/10 pt-6">
              <span className="mt-2 size-2 shrink-0 rounded-full bg-red" aria-hidden />
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="mt-1.5 text-sm text-smoke">{r.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 11 — Downloads */}
      <section id="downloads" className="scroll-mt-18 bg-paper py-24 md:py-32">
        <div className="container-page">
          <SectionHeading
            eyebrow="11 · Downloads"
            title={
              <>
                Take the <span className="serif-italic font-normal">master tapes.</span>
              </>
            }
            aside={
              <p className="max-w-sm text-smoke">
                Vector SVGs with outlined type, so they work anywhere without fonts. Please use them as they are.
              </p>
            }
            className="mb-12"
          />
          <ul className="overflow-hidden rounded-[28px] bg-bone">
            {FILES.map((f, i) => (
              <li key={f.file} className={cn("grid items-center gap-4 p-4 sm:grid-cols-[132px_minmax(0,1fr)_auto] sm:gap-6 md:px-6", i > 0 && "border-t border-ink/8")}>
                <div className={cn("flex h-20 items-center justify-center rounded-2xl px-5", f.surface === "ink" ? "bg-ink" : "bg-paper")}>
                  <div className="w-full">{f.preview}</div>
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{f.name}</p>
                  <p className="text-sm text-smoke">{f.note}</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-smoke">
                    {f.file}
                    {SIZES[f.file] && ` · ${SIZES[f.file]}`}
                  </p>
                </div>
                <a
                  href={`/brand/${f.file}`}
                  download={f.file}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bone transition hover:bg-ink-3"
                >
                  <Download className="size-4" aria-hidden /> Download SVG
                  <span className="sr-only">: {f.name}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 px-1">
            <p className="text-smoke">Need a PNG, an EPS or something for press? Ask, and we&apos;ll send what you need.</p>
            <Link href="/help#contact" className="group/contact inline-flex items-center gap-2 font-medium">
              Get in touch <ArrowRight className="size-4 transition group-hover/contact:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
