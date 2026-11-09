import { Gavel, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader({
  onTrySample,
  onHome,
  busy,
}: {
  onTrySample: () => void;
  onHome: () => void;
  busy: boolean;
}) {
  return (
    <header className="no-print border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={onHome}
          className="group flex items-center gap-3 rounded-sm text-left"
          aria-label="Petty Court — return to the filing desk"
        >
          <span className="grid size-10 place-items-center rounded-full border border-gold/50 text-gold transition-colors group-hover:border-gold">
            <Scale className="size-5" aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-bold tracking-[0.28em] text-cream">
              PETTY COURT
            </span>
            <span className="text-xs text-muted-foreground">
              Department of Unnecessary Justice
            </span>
          </span>
        </button>
        <Button
          variant="outline"
          onClick={onTrySample}
          disabled={busy}
          className="h-10 gap-2 border-gold/40 bg-transparent px-4 text-cream hover:border-gold hover:bg-gold/10 dark:bg-transparent"
        >
          <Gavel className="size-4 text-gold" aria-hidden />
          <span>Try sample case</span>
        </Button>
      </div>
    </header>
  );
}
