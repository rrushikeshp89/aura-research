import type { Verdict } from "./research";

export type AlertType = "verdict_change" | "sentiment_shift" | "confidence_drop";

export interface AlertSettings {
  id: string;
  ticker: string;
  company: string;
  alertOnVerdictChange: boolean;
  alertOnSentimentShift: boolean;
  alertOnConfidenceDrop: boolean;
  confidenceThreshold: number;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AlertNotification {
  id: string;
  ticker: string;
  company: string;
  alertType: AlertType;
  title: string;
  message: string;
  oldValue: string | null;
  newValue: string | null;
  read: boolean;
  createdAt: number;
}

export interface SectorCompany {
  ticker: string;
  company: string;
  verdict: Verdict;
  confidenceScore: number;
  sentiment: "Bullish" | "Neutral" | "Bearish";
  executiveSummary: string;
}

export interface SectorAnalysis {
  sector: string;
  companies: SectorCompany[];
  averageConfidence: number;
  sentimentDistribution: {
    bullish: number;
    neutral: number;
    bearish: number;
  };
  verdictDistribution: {
    buy: number;
    hold: number;
    sell: number;
  };
}
