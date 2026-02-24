import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { VerdictBadge } from "@/components/VerdictBadge";
import { AlertSettingsButton } from "@/components/AlertSettings";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, Eye, GitCompareArrows } from "lucide-react";
import type { WatchlistItem } from "@/hooks/useWatchlist";
import type { AlertSettings } from "@/types/alerts";

interface WatchlistPanelProps {
    items: WatchlistItem[];
    onRemove: (ticker: string) => void;
    onReResearch: (company: string) => void;
    onViewReport: (item: WatchlistItem) => void;
    alertSettings?: AlertSettings[];
    onSaveAlertSettings?: (ticker: string, company: string, updates: Partial<Omit<AlertSettings, "id" | "ticker" | "company" | "createdAt" | "updatedAt">>) => void;
}

export function WatchlistPanel({ items, onRemove, onReResearch, onViewReport, alertSettings, onSaveAlertSettings }: WatchlistPanelProps) {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<Set<string>>(new Set());

    if (items.length === 0) return null;

    function toggleSelect(ticker: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(ticker)) next.delete(ticker);
            else if (next.size < 3) next.add(ticker);
            return next;
        });
    }

    function handleCompare() {
        if (selected.size >= 2) {
            navigate(`/compare?tickers=${Array.from(selected).join(",")}`);
        }
    }

    function timeAgo(ts: number): string {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">Your Watchlist</h2>
                <AnimatePresence>
                    {selected.size >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <Button size="sm" onClick={handleCompare} className="gap-2">
                                <GitCompareArrows className="h-4 w-4" />
                                Compare ({selected.size})
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {items.map((item) => {
                        const isSelected = selected.has(item.ticker);
                        return (
                            <motion.div
                                key={item.ticker}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ y: -2 }}
                                onClick={() => toggleSelect(item.ticker)}
                                className={`
                  relative rounded-xl border p-4 cursor-pointer transition-all
                  bg-card/60 backdrop-blur-sm hover:shadow-lg
                  ${isSelected
                                        ? "border-primary ring-2 ring-primary/30 shadow-md"
                                        : "border-border hover:border-muted-foreground/30"
                                    }
                `}
                            >
                                {/* Selection indicator */}
                                <div className={`absolute top-3 right-3 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
                                    }`}>
                                    {isSelected && (
                                        <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>

                                {/* Card content */}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-foreground truncate pr-8">{item.company}</h3>
                                        <p className="text-xs text-muted-foreground">{item.ticker} · {timeAgo(item.updatedAt)}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <VerdictBadge verdict={item.verdict} confidence={item.confidenceScore} />
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {item.confidenceScore}% confidence
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => { e.stopPropagation(); onViewReport(item); }}
                                        >
                                            <Eye className="h-3 w-3 mr-1" /> View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => { e.stopPropagation(); onReResearch(item.company); }}
                                        >
                                            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                                        </Button>
                                        {onSaveAlertSettings && (
                                          <span onClick={(e) => e.stopPropagation()}>
                                            <AlertSettingsButton
                                              ticker={item.ticker}
                                              company={item.company}
                                              currentSettings={alertSettings?.find((s) => s.ticker === item.ticker) ?? null}
                                              onSave={onSaveAlertSettings}
                                            />
                                          </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); onRemove(item.ticker); }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {items.length >= 2 && selected.size === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    Select 2–3 cards to compare side-by-side
                </p>
            )}
        </div>
    );
}
