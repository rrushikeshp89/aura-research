import { supabase } from "@/integrations/supabase/client";
import type { SectorAnalysis } from "@/types/alerts";

/**
 * Search for a sector and get analysis of top companies within it.
 */
export async function analyzeSector(
  sector: string,
  onStep?: (step: { agent: string; message: string }) => void
): Promise<SectorAnalysis> {
  onStep?.({ agent: "sector", message: `Analyzing ${sector} sector companies…` });

  const { data, error } = await supabase.functions.invoke("sector-analysis", {
    body: { sector },
  });

  if (error) {
    let errorMessage = "Sector analysis failed";
    try {
      if (error.context && typeof (error.context as Record<string, unknown>).json === "function") {
        const body = await (error.context as Record<string, unknown> & { json: () => Promise<{ error?: string }> }).json();
        errorMessage = body?.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
    } catch {
      errorMessage = error.message || errorMessage;
    }
    throw new Error(errorMessage);
  }

  onStep?.({ agent: "sector", message: "Sector analysis complete." });

  return data.analysis as SectorAnalysis;
}
