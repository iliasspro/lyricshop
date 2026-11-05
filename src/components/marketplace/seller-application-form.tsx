"use client";

import { ArrowRight, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Field = "name" | "email" | "artist" | "link" | "genre" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = { name: "", email: "", artist: "", link: "", genre: "", message: "" };
const ORDER: Field[] = ["name", "email", "artist", "link", "genre", "message"];

const GENRES = [
  "Hip-hop / rap",
  "R&B / soul",
  "Pop",
  "Rock / punk",
  "Indie / alternative",
  "Folk / Americana",
  "Country",
  "Electronic",
  "Jazz",
  "Spoken word / poetry",
  "Something else",
];

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Tell us what to call you.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "That email doesn’t look right.";
  if (!v.artist.trim()) e.artist = "What do you put out music or writing as?";
  if (!v.link.trim()) e.link = "Add one link where we can hear or read you.";
  else if (!/^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i.test(v.link.trim())) e.link = "That link doesn’t look right.";
  if (!v.genre) e.genre = "Pick the closest genre.";
  return e;
}

const inputBase =
  "w-full rounded-2xl bg-white/70 px-4 text-[15px] ring-1 ring-ink/12 transition placeholder:text-smoke/70 hover:ring-ink/25 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink";

export function SellerApplicationForm() {
  const id = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<{ first: string } | null>(null);

  const set = (field: Field) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const bind = (field: Field) => ({
    id: `${id}-${field}`,
    name: field,
    value: values[field],
    onChange: set(field),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${id}-${field}-error` : undefined,
  });

  if (sent) {
    return (
      <div className="rounded-[28px] bg-white/60 p-8 ring-1 ring-ink/8 md:p-12" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-ok text-bone">
          <Check className="size-6" />
        </span>
        <p className="display mt-8 text-[clamp(2.2rem,4vw,3.4rem)]">
          Thanks, <span className="serif-italic font-normal">{sent.first}.</span>
        </p>
        <p className="mt-4 max-w-md text-lg text-smoke">
          That&rsquo;s everything we need. While you wait, mock up your first piece in the Studio or poke around the artist dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/studio" className={buttonClass("primary", "lg")}>
            Open the Studio <ArrowRight className="size-4" />
          </Link>
          <Link href="/sell/dashboard" className={buttonClass("outline", "lg")}>
            Demo dashboard
          </Link>
        </div>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY);
            setSent(null);
          }}
          className="link-underline mt-8 text-sm text-smoke hover:text-ink"
        >
          Send another application
        </button>
        <p className="mt-6 text-xs text-smoke">Demo store: nothing was sent or stored.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="rounded-[28px] bg-white/60 p-6 ring-1 ring-ink/8 md:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        const next = validate(values);
        setErrors(next);
        const firstBad = ORDER.find((f) => next[f]);
        if (firstBad) {
          document.getElementById(`${id}-${firstBad}`)?.focus();
          toast.error("Almost there", { description: next[firstBad] });
          return;
        }
        const first = values.name.trim().split(/\s+/)[0];
        setSent({ first });
        toast.success(`Thanks, ${first}! Your application is in.`, {
          description: `${values.artist.trim()} · ${values.genre}`,
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Row label="Your name" htmlFor={`${id}-name`} error={errors.name} errorId={`${id}-name-error`}>
          <input {...bind("name")} autoComplete="name" placeholder="First and last" className={cn(inputBase, "h-12")} />
        </Row>
        <Row label="Email" htmlFor={`${id}-email`} error={errors.email} errorId={`${id}-email-error`}>
          <input
            {...bind("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            className={cn(inputBase, "h-12")}
          />
        </Row>
        <Row label="Artist or band name" htmlFor={`${id}-artist`} error={errors.artist} errorId={`${id}-artist-error`}>
          <input {...bind("artist")} placeholder="What it says on the record" className={cn(inputBase, "h-12")} />
        </Row>
        <Row label="Genre" htmlFor={`${id}-genre`} error={errors.genre} errorId={`${id}-genre-error`}>
          <div className="relative">
            <select
              {...bind("genre")}
              className={cn(inputBase, "h-12 cursor-pointer appearance-none pr-11", !values.genre && "text-smoke/80")}
            >
              <option value="" disabled>
                Pick the closest
              </option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-smoke" />
          </div>
        </Row>
        <Row
          label="Where can we hear you?"
          hint="Streaming, Bandcamp, socials or a site"
          htmlFor={`${id}-link`}
          error={errors.link}
          errorId={`${id}-link-error`}
          className="sm:col-span-2"
        >
          <input
            {...bind("link")}
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="bandcamp.com/yourname"
            className={cn(inputBase, "h-12")}
          />
        </Row>
        <Row
          label="Anything else?"
          hint="Optional"
          htmlFor={`${id}-message`}
          error={errors.message}
          errorId={`${id}-message-error`}
          className="sm:col-span-2"
        >
          <textarea
            {...bind("message")}
            rows={4}
            placeholder="The lines you’d want on a hoodie, the shows you’re playing, the fans who’d wear it…"
            className={cn(inputBase, "min-h-32 resize-y py-3 leading-relaxed")}
          />
        </Row>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xs text-xs leading-relaxed text-smoke">
          Demo store: this form doesn&rsquo;t send or store anything. Only apply with words you wrote or have the rights to.
        </p>
        <Button type="submit" variant="accent" size="lg">
          Send application <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}

function Row({
  label,
  hint,
  htmlFor,
  error,
  errorId,
  className,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  error?: string;
  errorId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between gap-3 text-sm font-medium">
        {label}
        {hint && <span className="text-xs font-normal text-smoke">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-deep">
          {error}
        </p>
      )}
    </div>
  );
}
