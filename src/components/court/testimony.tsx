import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const Testimony = forwardRef<
  HTMLHeadingElement,
  {
    role: string;
    speaker: string;
    icon: LucideIcon;
    text: string;
    tone?: "gold" | "cream" | "burgundy";
    children?: React.ReactNode;
  }
>(function Testimony({ role, speaker, icon: Icon, text, tone = "gold", children }, ref) {
  const paragraphs = splitLead(text);
  return (
    <section className="reveal relative grid gap-4 sm:grid-cols-[11rem_1fr] sm:gap-10">
      <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-full border",
            tone === "gold" && "border-gold/50 text-gold",
            tone === "cream" && "border-cream/40 text-cream",
            tone === "burgundy" && "border-burgundy bg-burgundy/20 text-cream",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <h3 ref={ref} tabIndex={-1} className="label-proc text-gold outline-none focus-visible:outline-2">
            {role}
          </h3>
          <p className="text-xs text-muted-foreground">{speaker}</p>
        </div>
      </div>
      <div className="border-l border-border pl-6 sm:pl-8">
        <div className="flex flex-col gap-4">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={cn(
                "leading-relaxed text-cream/85",
                i === 0 ? "text-xl font-medium text-cream sm:text-2xl sm:leading-snug" : "text-base sm:text-lg",
              )}
            >
              {p}
            </p>
          ))}
        </div>
        {children}
      </div>
    </section>
  );
});

/** Splits off the first sentence so it reads as the headline line. */
function splitLead(text: string): string[] {
  const t = text.trim();
  const m = t.match(/^(.{12,220}?[.!?][”"’']?)\s+(\S[\s\S]*)$/);
  return m ? [m[1], m[2]] : [t];
}
