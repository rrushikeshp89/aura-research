import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SectorCompany } from "@/types/alerts";
import type { Verdict } from "@/types/research";

interface SectorHeatmapProps {
  companies: SectorCompany[];
  onCompanyClick?: (ticker: string, company: string) => void;
}

const sentimentColor: Record<string, { bg: string; border: string; text: string }> = {
  Bullish: {
    bg: "hsla(152, 69%, 41%, 0.18)",
    border: "hsla(152, 69%, 41%, 0.45)",
    text: "hsl(152, 69%, 41%)",
  },
  Neutral: {
    bg: "hsla(38, 92%, 50%, 0.18)",
    border: "hsla(38, 92%, 50%, 0.45)",
    text: "hsl(38, 92%, 50%)",
  },
  Bearish: {
    bg: "hsla(0, 72%, 51%, 0.18)",
    border: "hsla(0, 72%, 51%, 0.45)",
    text: "hsl(0, 72%, 51%)",
  },
};

const verdictLabel: Record<Verdict, string> = {
  Buy: "BUY",
  Hold: "HOLD",
  Sell: "SELL",
};

export function SectorHeatmap({ companies, onCompanyClick }: SectorHeatmapProps) {
  // Scale tile size proportional to confidence
  const maxConfidence = Math.max(...companies.map((c) => c.confidenceScore), 1);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {companies.map((company, i) => {
          const colors = sentimentColor[company.sentiment] || sentimentColor.Neutral;
          const sizeScale = 0.7 + 0.3 * (company.confidenceScore / maxConfidence);

          return (
            <Tooltip key={company.ticker}>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onCompanyClick?.(company.ticker, company.company)}
                  className="relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-shadow duration-300 hover:shadow-lg cursor-pointer"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    minHeight: `${sizeScale * 120}px`,
                  }}
                >
                  {/* Ticker */}
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    {company.ticker}
                  </span>

                  {/* Confidence */}
                  <span
                    className="text-2xl font-black tabular-nums"
                    style={{ color: colors.text }}
                  >
                    {company.confidenceScore}%
                  </span>

                  {/* Verdict badge */}
                  <span
                    className="mt-1 text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5"
                    style={{
                      color: colors.text,
                      backgroundColor: `${colors.text}1a`,
                    }}
                  >
                    {verdictLabel[company.verdict]}
                  </span>

                  {/* Sentiment indicator dot */}
                  <motion.div
                    className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors.text }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">
                    {company.company} ({company.ticker})
                  </p>
                  <p className="text-xs text-muted-foreground">{company.executiveSummary}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span style={{ color: colors.text }}>{company.sentiment}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>{company.verdict}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>{company.confidenceScore}% confidence</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
