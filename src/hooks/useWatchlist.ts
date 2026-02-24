import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import type { ResearchReport } from "@/types/research";

export interface WatchlistItem {
    id: string;
    company: string;
    ticker: string;
    verdict: "Buy" | "Hold" | "Sell";
    confidenceScore: number;
    report: ResearchReport;
    createdAt: number;
    updatedAt: number;
}

const LOCAL_KEY = "strategyroom_watchlist";

function loadLocal(): WatchlistItem[] {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveLocal(items: WatchlistItem[]) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export function useWatchlist() {
    const { user } = useAuth();
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Load watchlist
    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);

            if (user) {
                const { data, error } = await supabase
                    .from("watchlist")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (!error && data && !cancelled) {
                    setItems(
                        data.map((row) => ({
                            id: row.id,
                            company: row.company,
                            ticker: row.ticker,
                            verdict: row.verdict as WatchlistItem["verdict"],
                            confidenceScore: row.confidence_score,
                            report: row.report_json as unknown as ResearchReport,
                            createdAt: new Date(row.created_at).getTime(),
                            updatedAt: new Date(row.updated_at).getTime(),
                        }))
                    );
                }
            } else {
                if (!cancelled) setItems(loadLocal());
            }

            if (!cancelled) setLoading(false);
        }

        load();
        return () => { cancelled = true; };
    }, [user]);

    // Add or update
    const addToWatchlist = useCallback(
        async (report: ResearchReport) => {
            const now = Date.now();
            const item: WatchlistItem = {
                id: crypto.randomUUID(),
                company: report.company,
                ticker: report.ticker,
                verdict: report.verdict,
                confidenceScore: report.confidenceScore,
                report,
                createdAt: now,
                updatedAt: now,
            };

            if (user) {
                const { error } = await supabase.from("watchlist").upsert(
                    {
                        user_id: user.id,
                        company: report.company,
                        ticker: report.ticker,
                        verdict: report.verdict,
                        confidence_score: report.confidenceScore,
                        report_json: report as unknown as Record<string, unknown>,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id,ticker" }
                );

                if (!error) {
                    // Re-fetch to get correct IDs
                    const { data } = await supabase
                        .from("watchlist")
                        .select("*")
                        .order("created_at", { ascending: false });

                    if (data) {
                        setItems(
                            data.map((row) => ({
                                id: row.id,
                                company: row.company,
                                ticker: row.ticker,
                                verdict: row.verdict as WatchlistItem["verdict"],
                                confidenceScore: row.confidence_score,
                                report: row.report_json as unknown as ResearchReport,
                                createdAt: new Date(row.created_at).getTime(),
                                updatedAt: new Date(row.updated_at).getTime(),
                            }))
                        );
                    }
                }
            } else {
                const updated = [item, ...items.filter((i) => i.ticker !== report.ticker)];
                setItems(updated);
                saveLocal(updated);
            }
        },
        [user, items]
    );

    // Remove
    const removeFromWatchlist = useCallback(
        async (ticker: string) => {
            if (user) {
                await supabase.from("watchlist").delete().eq("ticker", ticker).eq("user_id", user.id);
            }
            const updated = items.filter((i) => i.ticker !== ticker);
            setItems(updated);
            if (!user) saveLocal(updated);
        },
        [user, items]
    );

    // Check
    const isInWatchlist = useCallback(
        (ticker: string) => items.some((i) => i.ticker === ticker),
        [items]
    );

    // Get report for comparison
    const getReport = useCallback(
        (ticker: string) => items.find((i) => i.ticker === ticker)?.report || null,
        [items]
    );

    return { items, loading, addToWatchlist, removeFromWatchlist, isInWatchlist, getReport };
}
