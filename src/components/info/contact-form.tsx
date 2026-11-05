"use client";

import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

const TOPICS = ["An order", "Returns & exchanges", "Sizing", "Selling on Lyricshop", "A Studio design", "Press", "Something else"];

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const field =
  "w-full rounded-2xl border border-ink/12 bg-bone px-4 text-[15px] outline-none transition placeholder:text-smoke/70 focus:border-ink aria-[invalid=true]:border-red";

/**
 * Client-only contact form. It validates and confirms with a toast; wire `onSubmit`
 * to an email service or help desk before launch, nothing is sent anywhere yet.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Tell us what to call you.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "That email doesn't look right.";
    if (message.length < 10) next.message = "A little more detail helps us help you.";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Almost there", { description: Object.values(next)[0] });
      const first = Object.keys(next)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setSentTo(email);
      form.reset();
      toast.success(`Thanks, ${name.split(" ")[0]}. Message received.`, {
        description: `We'll reply to ${email} as soon as we can.`,
      });
    }, 650);
  };

  if (sentTo) {
    return (
      <div className="flex min-h-[420px] flex-col items-start justify-center rounded-[28px] bg-ink p-8 text-bone md:p-12">
        <span className="grid size-12 place-items-center rounded-full bg-red text-ink">
          <Check className="size-5" />
        </span>
        <p className="display mt-8 text-[clamp(2rem,4vw,3rem)]">
          Got it. <span className="serif-italic font-normal text-red">Loud and clear.</span>
        </p>
        <p className="mt-4 max-w-md text-bone/65">
          Your message is in the queue. We&apos;ll write back to <span className="text-bone">{sentTo}</span>.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="mt-8 inline-flex items-center gap-2 text-sm text-bone/70 transition hover:text-bone"
        >
          <RotateCcw className="size-4" /> Send another
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-4 rounded-[28px] bg-paper p-5 sm:grid-cols-2 md:p-8">
      <Field label="Name" error={errors.name} htmlFor="contact-name">
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={cn(field, "h-12")}
        />
      </Field>
      <Field label="Email" error={errors.email} htmlFor="contact-email">
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={cn(field, "h-12")}
        />
      </Field>
      <Field label="Order number" hint="Optional" htmlFor="contact-order">
        <input id="contact-order" name="order" placeholder="If it's about an order" className={cn(field, "h-12 font-mono")} />
      </Field>
      <Field label="Topic" htmlFor="contact-topic">
        <select id="contact-topic" name="topic" defaultValue={TOPICS[0]} className={cn(field, "h-12 appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10")} style={{ backgroundImage: CHEVRON }}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Message" error={errors.message} htmlFor="contact-message" className="sm:col-span-2">
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          placeholder="What's going on?"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={cn(field, "resize-y py-3 leading-relaxed")}
        />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
        <p className="text-sm text-smoke">A real person reads every message.</p>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-bone transition hover:bg-ink-3 disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send message"} <ArrowRight className="size-4" />
        </button>
      </div>
    </form>
  );
}

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' fill='none' stroke='%230F0E0D' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

function Field({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between text-sm font-medium">
        {label}
        {hint && <span className="font-normal text-smoke">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-2 flex items-center gap-2 text-sm">
          <span className="size-1.5 shrink-0 rounded-full bg-red" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
