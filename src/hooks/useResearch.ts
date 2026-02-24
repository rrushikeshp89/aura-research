import { useState, useCallback, useEffect } from "react";
import type { ResearchReport, AgentStep, ResearchHistoryItem } from "@/types/research";
import { startResearch } from "@/lib/api/research";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

/* ── localStorage fallback ── */
const HISTORY_KEY = "liquid-research-history";

function loadLocalHistory(): ResearchHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalHistory(items: ResearchHistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 20)));
}

/* ── Supabase helpers ── */
async function loadSupabaseHistory(userId: string): Promise<ResearchHistoryItem[]> {
  const { data, error } = await supabase
    .from("research_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    company: row.company,
    ticker: row.ticker,
    verdict: row.verdict as ResearchHistoryItem["verdict"],
    confidenceScore: row.confidence_score,
    timestamp: new Date(row.created_at).getTime(),
  }));
}

async function insertSupabaseHistory(
  userId: string,
  item: ResearchHistoryItem,
): Promise<void> {
  // Upsert: delete existing entry for the same ticker, then insert
  await supabase
    .from("research_history")
    .delete()
    .eq("user_id", userId)
    .eq("ticker", item.ticker);

  await supabase.from("research_history").insert({
    id: item.id,
    user_id: userId,
    company: item.company,
    ticker: item.ticker,
    verdict: item.verdict,
    confidence_score: item.confidenceScore,
    created_at: new Date(item.timestamp).toISOString(),
  });
}

async function clearSupabaseHistory(userId: string): Promise<void> {
  await supabase
    .from("research_history")
    .delete()
    .eq("user_id", userId);
}

async function migrateLocalToSupabase(userId: string): Promise<void> {
  const localItems = loadLocalHistory();
  if (localItems.length === 0) return;

  // insert all local items that don't already exist in Supabase
  for (const item of localItems) {
    await supabase.from("research_history").upsert(
      {
        id: item.id,
        user_id: userId,
        company: item.company,
        ticker: item.ticker,
        verdict: item.verdict,
        confidence_score: item.confidenceScore,
        created_at: new Date(item.timestamp).toISOString(),
      },
      { onConflict: "id" },
    );
  }

  // Clear localStorage after successful migration
  localStorage.removeItem(HISTORY_KEY);
}

/* ── Hook ── */
export function useResearch() {
  const { user } = useAuth();
  const [isResearching, setIsResearching] = useState(false);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* ── Load + migrate history on mount / auth change ── */
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (user) {
        // Migrate any localStorage items to Supabase on first sign-in
        await migrateLocalToSupabase(user.id);
        const items = await loadSupabaseHistory(user.id);
        if (!cancelled) setHistory(items);
      } else {
        setHistory(loadLocalHistory());
      }
    }

    loadHistory();
    return () => { cancelled = true; };
  }, [user]);

  const addStep = useCallback((agent: string, message: string, status: "running" | "complete" = "running") => {
    const step: AgentStep = {
      id: crypto.randomUUID(),
      agent: agent as "researcher" | "analyst",
      message,
      timestamp: Date.now(),
      status,
    };
    setSteps((prev) => {
      const updated = prev.map((s) => (s.status === "running" ? { ...s, status: "complete" as const } : s));
      return [...updated, step];
    });
  }, []);

  const research = useCallback(async (company: string) => {
    setIsResearching(true);
    setReport(null);
    setSteps([]);
    setError(null);

    try {
      const result = await startResearch(company, ({ agent, message }) => {
        addStep(agent, message);
      });

      addStep("analyst", "Report complete.", "complete");
      setReport(result);

      const item: ResearchHistoryItem = {
        id: crypto.randomUUID(),
        company: result.company,
        ticker: result.ticker,
        verdict: result.verdict,
        confidenceScore: result.confidenceScore,
        timestamp: Date.now(),
      };

      const updated = [item, ...history.filter((h) => h.ticker !== result.ticker)];
      setHistory(updated);

      if (user) {
        await insertSupabaseHistory(user.id, item);
      } else {
        saveLocalHistory(updated);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Research failed";
      setError(message);
      addStep("analyst", `Error: ${message}`, "complete");
    } finally {
      setIsResearching(false);
    }
  }, [addStep, history, user]);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    if (user) {
      await clearSupabaseHistory(user.id);
    } else {
      saveLocalHistory([]);
    }
  }, [user]);

  return {
    isResearching, report, steps, history, error,
    research, clearHistory,
  };
}
