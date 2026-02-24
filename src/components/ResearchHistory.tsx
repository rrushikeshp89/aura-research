import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerdictBadge } from "@/components/VerdictBadge";
import type { ResearchHistoryItem } from "@/types/research";

interface ResearchHistoryProps {
  items: ResearchHistoryItem[];
  onSelect: (company: string) => void;
  onClear: () => void;
}

export function ResearchHistory({ items, onSelect, onClear }: ResearchHistoryProps) {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" /> Recent Research
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3 w-3 mr-1" /> Clear
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.slice(0, 6).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.ticker)}
            className="flex items-center justify-between rounded-lg bg-card border border-border p-3 hover:border-primary/40 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.company}</p>
              <span className="text-xs font-mono text-muted-foreground">{item.ticker}</span>
            </div>
            <VerdictBadge verdict={item.verdict} confidence={item.confidenceScore} />
          </button>
        ))}
      </div>
    </div>
  );
}
