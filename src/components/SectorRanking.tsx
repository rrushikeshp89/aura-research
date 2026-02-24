import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SectorCompany } from "@/types/alerts";
import type { Verdict } from "@/types/research";

interface SectorRankingProps {
  companies: SectorCompany[];
  onCompanyClick?: (ticker: string, company: string) => void;
}

const verdictStyles: Record<Verdict, { variant: "default" | "secondary" | "destructive"; icon: typeof TrendingUp }> = {
  Buy: { variant: "default", icon: TrendingUp },
  Hold: { variant: "secondary", icon: Minus },
  Sell: { variant: "destructive", icon: TrendingDown },
};

const sentimentColors: Record<string, string> = {
  Bullish: "hsl(152, 69%, 41%)",
  Neutral: "hsl(38, 92%, 50%)",
  Bearish: "hsl(0, 72%, 51%)",
};

export function SectorRanking({ companies, onCompanyClick }: SectorRankingProps) {
  // Sort by confidence descending
  const sorted = [...companies].sort((a, b) => b.confidenceScore - a.confidenceScore);

  return (
    <div className="space-y-2">
      {sorted.map((company, i) => {
        const style = verdictStyles[company.verdict] || verdictStyles.Hold;
        const VerdictIcon = style.icon;
        const sentColor = sentimentColors[company.sentiment] || sentimentColors.Neutral;

        return (
          <motion.div
            key={company.ticker}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] as const }}
            onClick={() => onCompanyClick?.(company.ticker, company.company)}
            className="group flex items-center gap-4 rounded-lg border bg-card/60 p-3 cursor-pointer transition-all duration-200 hover:bg-accent/30 hover:shadow-md hover:scale-[1.01]"
          >
            {/* Rank */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
              {i + 1}
            </div>

            {/* Company info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground truncate">
                  {company.ticker}
                </span>
                <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                  {company.company}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {company.executiveSummary}
              </p>
            </div>

            {/* Sentiment dot */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: sentColor }}
              />
              <span className="text-[10px] font-medium text-muted-foreground hidden md:inline">
                {company.sentiment}
              </span>
            </div>

            {/* Confidence bar */}
            <div className="w-20 shrink-0 hidden sm:block">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                <span>Conf.</span>
                <span className="font-bold tabular-nums">{company.confidenceScore}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: sentColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${company.confidenceScore}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 + 0.2 }}
                />
              </div>
            </div>

            {/* Verdict badge */}
            <Badge variant={style.variant} className="shrink-0 gap-1">
              <VerdictIcon className="h-3 w-3" />
              {company.verdict}
            </Badge>

            {/* Research action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompanyClick?.(company.ticker, company.company);
              }}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title={`Research ${company.company}`}
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
