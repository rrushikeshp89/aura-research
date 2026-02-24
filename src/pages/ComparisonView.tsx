import { useSearchParams, useNavigate } from "react-router-dom";
import { useWatchlist } from "@/hooks/useWatchlist";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { ResearchReport } from "@/types/research";

export default function ComparisonView() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tickerStr = searchParams.get("tickers") || "";
    const tickers = tickerStr.split(",").filter(Boolean);
    const { getReport } = useWatchlist();

    const reports: ResearchReport[] = tickers
        .map((t) => getReport(t))
        .filter((r): r is ResearchReport => r !== null);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mr-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <img src="/src/assets/strategyroom-logo.svg" alt="StrategyRoom.ai" className="h-8 w-auto" />
                        <span className="font-semibold text-foreground tracking-tight text-xl">StrategyRoom.ai</span>
                    </div>
                    <UserMenu />
                </div>
            </header>

            <motion.main
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto px-6 py-8 space-y-8"
            >
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground">
                        Comparing {reports.map((r) => r.ticker).join(" vs ")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Side-by-side analysis of {reports.length} companies from your watchlist
                    </p>
                </div>

                {reports.length < 2 ? (
                    <div className="rounded-xl border border-border bg-card/60 p-8 text-center">
                        <p className="text-muted-foreground">
                            Need at least 2 companies in your watchlist to compare. Go back and add more.
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
                            Back to Dashboard
                        </Button>
                    </div>
                ) : (
                    <>
                        <ComparisonTable reports={reports} />
                        <ComparisonChart reports={reports} />

                        {/* Executive summaries */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reports.map((r) => (
                                <div key={r.ticker} className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 space-y-2">
                                    <h3 className="font-semibold text-foreground">{r.company} <span className="text-muted-foreground text-sm">({r.ticker})</span></h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{r.executiveSummary}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </motion.main>
        </div>
    );
}
