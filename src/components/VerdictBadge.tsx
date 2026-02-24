import { cn } from "@/lib/utils";
import type { Verdict } from "@/types/research";

interface VerdictBadgeProps {
  verdict: Verdict;
  confidence: number;
  size?: "sm" | "lg";
}

export function VerdictBadge({ verdict, confidence, size = "sm" }: VerdictBadgeProps) {
  const colorClass =
    verdict === "Buy"
      ? "bg-positive/15 text-positive border-positive/30"
      : verdict === "Sell"
        ? "bg-destructive/15 text-destructive border-destructive/30"
        : "bg-warning/15 text-warning border-warning/30";

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border font-semibold", colorClass, size === "lg" ? "px-5 py-2 text-lg" : "px-3 py-1 text-xs")}>
      <span>{verdict}</span>
      <span className="opacity-70">·</span>
      <span className="font-mono">{confidence}%</span>
    </div>
  );
}
