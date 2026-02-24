import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, BarChart3, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserMenu } from "@/components/UserMenu";
import { SectorHeatmap } from "@/components/charts/SectorHeatmap";
import { SectorRanking } from "@/components/SectorRanking";
import { analyzeSector } from "@/lib/api/sector";
import type { SectorAnalysis } from "@/types/alerts";

const POPULAR_SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Energy",
  "Consumer Discretionary",
  "Industrials",
  "Real Estate",
  "Utilities",
];

export default function SectorView() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SectorAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (sector: string) => {
    if (!sector.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setQuery(sector.trim());

    try {
      const result = await analyzeSector(sector.trim());
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sector analysis failed");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleCompanyClick = (ticker: string, company: string) => {
    navigate(`/?search=${encodeURIComponent(company)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <span className="font-semibold text-foreground tracking-tight text-xl">Sector Analysis</span>
          </div>
          <UserMenu />
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-6 py-8 space-y-8"
      >
        {/* Sector search */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Sector Search</h1>
            <p className="text-sm text-muted-foreground">
              Analyze an entire sector — see sentiment heatmap, company rankings, and distribution
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="w-full"
          >
            <motion.div
              className="relative"
              animate={{ scale: isFocused ? 1.01 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div
                className={`
                  relative flex items-center w-full rounded-xl overflow-hidden
                  transition-all duration-500 border backdrop-blur-xl
                  ${isFocused
                    ? "bg-white/[0.12] border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
                    : "bg-white/[0.08] border-white/[0.15] hover:border-white/[0.25]"
                  }
                `}
              >
                <div className="flex items-center pl-5 pr-3">
                  <Search className={`h-5 w-5 transition-colors ${isFocused ? "text-amber-400" : "text-white/40"}`} />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search a sector (e.g., Technology, Healthcare, Energy)…"
                  disabled={isLoading}
                  className="flex-1 h-14 bg-transparent text-white text-base placeholder:text-white/30 outline-none border-none font-medium"
                />
                <div className="pr-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !query.trim()}
                    className="rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </form>

          {/* Quick sector pills */}
          <div className="flex flex-wrap gap-2">
            {POPULAR_SECTORS.map((sector) => (
              <button
                key={sector}
                onClick={() => handleSearch(sector)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card/60 text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:scale-105 disabled:opacity-50"
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
              <p className="text-muted-foreground text-sm">Analyzing {query} sector…</p>
            </motion.div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
            >
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSearch(query)}>
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Results */}
          {analysis && !isLoading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                  label="Companies"
                  value={String(analysis.companies.length)}
                  sub={`in ${analysis.sector}`}
                />
                <SummaryCard
                  label="Avg Confidence"
                  value={`${Math.round(analysis.averageConfidence)}%`}
                  sub="across sector"
                />
                <SummaryCard
                  label="Sentiment"
                  value={dominantSentiment(analysis)}
                  sub={`${analysis.sentimentDistribution.bullish}B · ${analysis.sentimentDistribution.neutral}N · ${analysis.sentimentDistribution.bearish}Be`}
                />
                <SummaryCard
                  label="Verdicts"
                  value={dominantVerdict(analysis)}
                  sub={`${analysis.verdictDistribution.buy}Buy · ${analysis.verdictDistribution.hold}Hold · ${analysis.verdictDistribution.sell}Sell`}
                />
              </div>

              {/* Tabs: Heatmap / Ranking */}
              <Tabs defaultValue="heatmap" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="heatmap">Sentiment Heatmap</TabsTrigger>
                  <TabsTrigger value="ranking">Company Rankings</TabsTrigger>
                </TabsList>

                <TabsContent value="heatmap" className="mt-6">
                  <SectorHeatmap companies={analysis.companies} onCompanyClick={handleCompanyClick} />
                </TabsContent>

                <TabsContent value="ranking" className="mt-6">
                  <SectorRanking companies={analysis.companies} onCompanyClick={handleCompanyClick} />
                </TabsContent>
              </Tabs>

              {/* Distribution bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DistributionBar
                  title="Sentiment Distribution"
                  segments={[
                    { label: "Bullish", count: analysis.sentimentDistribution.bullish, color: "hsl(152, 69%, 41%)" },
                    { label: "Neutral", count: analysis.sentimentDistribution.neutral, color: "hsl(38, 92%, 50%)" },
                    { label: "Bearish", count: analysis.sentimentDistribution.bearish, color: "hsl(0, 72%, 51%)" },
                  ]}
                  total={analysis.companies.length}
                />
                <DistributionBar
                  title="Verdict Distribution"
                  segments={[
                    { label: "Buy", count: analysis.verdictDistribution.buy, color: "hsl(152, 69%, 41%)" },
                    { label: "Hold", count: analysis.verdictDistribution.hold, color: "hsl(38, 92%, 50%)" },
                    { label: "Sell", count: analysis.verdictDistribution.sell, color: "hsl(0, 72%, 51%)" },
                  ]}
                  total={analysis.companies.length}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 space-y-1"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

function DistributionBar({
  title,
  segments,
  total,
}: {
  title: string;
  segments: { label: string; count: number; color: string }[];
  total: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="h-4 rounded-full overflow-hidden flex bg-secondary/40">
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.count / total) * 100 : 0;
          return (
            <motion.div
              key={seg.label}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: seg.color }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span>
              {seg.label} ({seg.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function dominantSentiment(analysis: SectorAnalysis): string {
  const { bullish, neutral, bearish } = analysis.sentimentDistribution;
  if (bullish >= neutral && bullish >= bearish) return "Bullish";
  if (bearish >= neutral && bearish >= bullish) return "Bearish";
  return "Neutral";
}

function dominantVerdict(analysis: SectorAnalysis): string {
  const { buy, hold, sell } = analysis.verdictDistribution;
  if (buy >= hold && buy >= sell) return "Buy";
  if (sell >= hold && sell >= buy) return "Sell";
  return "Hold";
}
