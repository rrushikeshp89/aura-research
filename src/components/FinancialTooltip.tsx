import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { lookupGlossary } from "@/lib/glossary";
import { Info } from "lucide-react";

interface FinancialTooltipProps {
  /** The glossary key to look up (e.g. "pe-ratio", "revenue", "bullish") */
  term: string;
  /** Child content to wrap — typically the label text */
  children: ReactNode;
  /** Show the (i) icon indicator next to children */
  showIcon?: boolean;
  /** Tooltip placement */
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Wraps any label with a hover tooltip that shows a plain-English
 * explanation from the financial glossary.
 *
 * If the term is not found in the glossary, renders children as-is
 * without a tooltip.
 */
export function FinancialTooltip({
  term,
  children,
  showIcon = true,
  side = "top",
}: FinancialTooltipProps) {
  const entry = lookupGlossary(term);

  // No glossary match — render children without a tooltip
  if (!entry) return <>{children}</>;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-amber-400/30 hover:border-amber-400/60 transition-colors">
          {children}
          {showIcon && (
            <Info className="h-3 w-3 text-amber-400/50 shrink-0" />
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="font-semibold text-foreground text-xs mb-0.5">{entry.term}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{entry.definition}</p>
      </TooltipContent>
    </Tooltip>
  );
}
