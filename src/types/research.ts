export type Verdict = "Buy" | "Hold" | "Sell";

export interface ReasoningStep {
  step: number;
  title: string;
  analysis: string;
  evidence: string;
  impact: "Bullish" | "Bearish" | "Neutral";
}

export interface ConfidenceBreakdown {
  fundamentalStrength: number;  // 0-100
  sentimentSignal: number;      // 0-100
  dataQuality: number;          // 0-100
  riskAdjustment: number;       // 0-100
  explanation: string;
}

export interface ResearchReport {
  company: string;
  ticker: string;
  verdict: Verdict;
  confidenceScore: number; // 0-100
  executiveSummary: string;
  fundamentals: {
    revenue: string;
    earnings: string;
    peRatio: string;
    marketCap: string;
    balanceSheetHighlights: string[];
  };
  sentimentAnalysis: {
    overallSentiment: "Bullish" | "Neutral" | "Bearish";
    newsSummary: string;
    analystConsensus: string;
  };
  riskFactors: string[];
  sources: { title: string; url: string }[];
  reasoningChain?: ReasoningStep[];
  confidenceBreakdown?: ConfidenceBreakdown;
}

export interface AgentStep {
  id: string;
  agent: "researcher" | "analyst";
  message: string;
  timestamp: number;
  status: "running" | "complete" | "error";
}

export interface ResearchHistoryItem {
  id: string;
  company: string;
  ticker: string;
  verdict: Verdict;
  confidenceScore: number;
  timestamp: number;
}
