"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      className={cn(
        "mt-8 flex max-w-md items-center gap-2 rounded-full border p-1.5 pl-5 transition focus-within:border-red",
        tone === "dark" ? "border-bone/20" : "border-ink/15 bg-white/50",
      )}
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          toast.error("That email doesn't look right");
          return;
        }
        setDone(true);
        toast.success("You're on the list", { description: "We'll write when the next drop lands." });
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className={cn(
          "min-w-0 flex-1 bg-transparent text-[15px] outline-none",
          tone === "dark" ? "placeholder:text-bone/35" : "placeholder:text-smoke",
        )}
        disabled={done}
      />
      <button
        type="submit"
        disabled={done}
        className="flex h-10 items-center gap-2 rounded-full bg-red px-4 text-sm font-medium text-ink transition hover:bg-[#ff6a40] disabled:bg-ok disabled:text-bone"
      >
        {done ? (
          <>
            <Check className="size-4" /> Subscribed
          </>
        ) : (
          <>
            Subscribe <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
