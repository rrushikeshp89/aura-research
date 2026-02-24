import { supabase } from "@/integrations/supabase/client";
import type { ResearchReport } from "@/types/research";

export async function startResearch(
  company: string,
  onStep: (step: { agent: string; message: string }) => void
): Promise<ResearchReport> {
  // Step 1: Call Researcher Agent
  onStep({ agent: "researcher", message: `Searching for ${company} financial data…` });

  const { data: researchData, error: researchError } = await supabase.functions.invoke("researcher", {
    body: { company },
  });

  if (researchError) {
    console.error("[Research] Researcher error:", researchError);
    throw new Error(researchError.message || "Research failed");
  }

  const sources = researchData?.research || [];
  console.log(`[Research] Collected ${sources.length} sources`);

  if (sources.length === 0) {
    console.warn("[Research] No research data collected — analyst will use general knowledge");
  }

  onStep({ agent: "researcher", message: `Raw data collected (${sources.length} sources). Passing to Analyst…` });

  // Step 2: Call Analyst Agent
  onStep({ agent: "analyst", message: "Analyzing financial data and generating verdict…" });

  const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyst", {
    body: { company, researchData: sources },
  });

  if (analysisError) {
    // Try to extract the actual error message from the response
    let errorMessage = "Analysis failed";
    try {
      if (analysisError.context && typeof analysisError.context.json === "function") {
        const body = await analysisError.context.json();
        errorMessage = body?.error || errorMessage;
      } else if (analysisError.message) {
        errorMessage = analysisError.message;
      }
    } catch {
      errorMessage = analysisError.message || errorMessage;
    }
    console.error("[Research] Analyst error detail:", errorMessage);
    throw new Error(errorMessage);
  }

  onStep({ agent: "analyst", message: "Report complete." });

  const report = analysisData.report as ResearchReport;

  // Override AI-generated sources with the real URLs from Firecrawl research.
  // Gemini often hallucinates URLs, so we use the actual researcher data.
  if (sources.length > 0) {
    report.sources = sources
      .filter((s: { title?: string; url?: string }) => s.url)
      .map((s: { title?: string; url?: string }) => ({
        title: s.title || new URL(s.url!).hostname,
        url: s.url!,
      }));
  }

  return report;
}
