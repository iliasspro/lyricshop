"use client";

import { TicketPercent, X } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { findPromo } from "@/lib/pricing";
import { useCart } from "@/lib/store/cart";
import { errorId, fieldClass, hintId } from "./form-fields";

/** Apply / remove a promo code on the bag. Render only after the stores have hydrated. */
export function PromoField({ className }: { className?: string }) {
  const promo = useCart((s) => s.promo);
  const applyPromo = useCart((s) => s.applyPromo);
  const removePromo = useCart((s) => s.removePromo);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const applied = findPromo(promo);

  if (applied) {
    return (
      <div className={cn("flex items-center gap-3 rounded-2xl border border-ok/25 bg-ok/8 py-2.5 pl-4 pr-2", className)}>
        <TicketPercent className="size-5 shrink-0 text-ok" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-medium">{applied.code}</p>
          <p className="truncate text-xs text-smoke">{applied.label}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            removePromo();
            toast(`${applied.code} removed`);
          }}
          className="grid size-9 shrink-0 place-items-center rounded-full text-smoke transition hover:bg-ink/6 hover:text-ink"
          aria-label={`Remove promo code ${applied.code}`}
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      className={className}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const value = code.trim();
        if (!value) {
          setError("Enter a code first");
          return;
        }
        if (applyPromo(value)) {
          const p = findPromo(value)!;
          setCode("");
          setError(null);
          toast.success(`${p.code} applied`, { description: p.label });
        } else {
          setError(`${value.toUpperCase()} isn't a valid code`);
        }
      }}
    >
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        Promo code
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Enter code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId(id) : hintId(id)}
          className={fieldClass(!!error, "h-12 font-mono uppercase placeholder:font-sans placeholder:normal-case")}
        />
        <Button type="submit" variant="outline" className="h-12 shrink-0 px-5">
          Apply
        </Button>
      </div>
      {error ? (
        <p id={errorId(id)} role="alert" className="pt-2 text-sm text-red-deep">
          {error}
        </p>
      ) : (
        <p id={hintId(id)} className="pt-2 text-xs text-smoke">
          First order? <span className="font-mono text-ink">FIRSTVERSE</span> takes 15% off.
        </p>
      )}
    </form>
  );
}
