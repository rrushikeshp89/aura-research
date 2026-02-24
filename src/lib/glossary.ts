/**
 * Financial Glossary
 *
 * Plain-English explanations of financial terms used throughout the
 * StrategyRoom.ai report UI.  Each key is a canonical term (lowercase,
 * kebab-cased where multi-word) and maps to a short definition suitable
 * for hover tooltips.
 */

export interface GlossaryEntry {
  term: string;       // Display label, e.g. "P/E Ratio"
  definition: string; // 1-2 sentence plain-English explanation
  category: "fundamental" | "sentiment" | "risk" | "verdict" | "metric";
}

export const glossary: Record<string, GlossaryEntry> = {
  /* ── Verdict & Confidence ─────────────────────────────── */
  verdict: {
    term: "Verdict",
    definition:
      "The AI's overall investment recommendation for this company — Buy, Hold, or Sell — based on the combined analysis of fundamentals, sentiment, and risk.",
    category: "verdict",
  },
  buy: {
    term: "Buy",
    definition:
      "A recommendation to purchase shares. The AI believes the stock is undervalued or has strong upside potential relative to its risks.",
    category: "verdict",
  },
  hold: {
    term: "Hold",
    definition:
      "A recommendation to maintain your current position. The AI sees balanced risk/reward with no strong reason to buy more or sell.",
    category: "verdict",
  },
  sell: {
    term: "Sell",
    definition:
      "A recommendation to reduce or exit your position. The AI identifies significant downside risks or overvaluation.",
    category: "verdict",
  },
  "confidence-score": {
    term: "Confidence Score",
    definition:
      "A 0–100 rating indicating how confident the AI is in its verdict. Higher scores mean stronger supporting evidence and data quality.",
    category: "metric",
  },

  /* ── Confidence Breakdown ─────────────────────────────── */
  "fundamental-strength": {
    term: "Fundamental Strength",
    definition:
      "A sub-score measuring how strong the company's financial health is — revenue growth, profitability, and balance sheet quality.",
    category: "metric",
  },
  "sentiment-signal": {
    term: "Sentiment Signal",
    definition:
      "A sub-score reflecting how positive or negative market sentiment is, based on recent news, social media, and analyst commentary.",
    category: "metric",
  },
  "data-quality": {
    term: "Data Quality",
    definition:
      "A sub-score rating the reliability, recency, and completeness of the data sources used for the analysis.",
    category: "metric",
  },
  "risk-adjustment": {
    term: "Risk Adjustment",
    definition:
      "A sub-score inversely related to risk — a higher value means fewer or less severe identified risks for this company.",
    category: "metric",
  },

  /* ── Fundamentals ─────────────────────────────────────── */
  revenue: {
    term: "Revenue",
    definition:
      "The total income a company earns from selling its products or services before any expenses are subtracted. Also called the 'top line'.",
    category: "fundamental",
  },
  earnings: {
    term: "Earnings (EPS)",
    definition:
      "Earnings Per Share — the portion of a company's profit allocated to each outstanding share of common stock. A key measure of profitability.",
    category: "fundamental",
  },
  "pe-ratio": {
    term: "P/E Ratio",
    definition:
      "Price-to-Earnings Ratio — the stock price divided by earnings per share. It shows how much investors pay for each dollar of earnings. A higher P/E may signal growth expectations; a lower one may indicate value.",
    category: "fundamental",
  },
  "market-cap": {
    term: "Market Cap",
    definition:
      "Market Capitalisation — the total value of a company's outstanding shares (share price × number of shares). It indicates the company's size.",
    category: "fundamental",
  },
  "balance-sheet": {
    term: "Balance Sheet",
    definition:
      "A financial statement summarising a company's assets (what it owns), liabilities (what it owes), and shareholders' equity at a point in time.",
    category: "fundamental",
  },

  /* ── Sentiment ────────────────────────────────────────── */
  bullish: {
    term: "Bullish",
    definition:
      "A positive market outlook — investors expect the stock price to rise. Often driven by strong earnings, favourable news, or economic optimism.",
    category: "sentiment",
  },
  neutral: {
    term: "Neutral",
    definition:
      "A balanced market outlook — no strong directional bias. The stock may trade sideways with mixed signals.",
    category: "sentiment",
  },
  bearish: {
    term: "Bearish",
    definition:
      "A negative market outlook — investors expect the stock price to fall. Often driven by poor results, negative news, or economic downturn.",
    category: "sentiment",
  },
  "analyst-consensus": {
    term: "Analyst Consensus",
    definition:
      "The combined opinion of professional Wall Street analysts on a stock, typically expressed as Buy, Hold, or Sell with an average price target.",
    category: "sentiment",
  },
  sentiment: {
    term: "Sentiment",
    definition:
      "The overall mood or attitude of investors toward a stock or the market, derived from news, social media, and analyst reports.",
    category: "sentiment",
  },

  /* ── Risk ─────────────────────────────────────────────── */
  "risk-factor": {
    term: "Risk Factor",
    definition:
      "A specific threat or uncertainty that could negatively affect the company's performance or stock price — such as regulation, competition, or debt.",
    category: "risk",
  },
  volatility: {
    term: "Volatility",
    definition:
      "A measure of how much a stock's price fluctuates over time. High volatility means bigger price swings and greater uncertainty.",
    category: "risk",
  },

  /* ── Sector Analysis ──────────────────────────────────── */
  sector: {
    term: "Sector",
    definition:
      "A broad group of companies that operate in the same area of the economy, such as Technology, Healthcare, or Energy.",
    category: "fundamental",
  },
  "sentiment-heatmap": {
    term: "Sentiment Heatmap",
    definition:
      "A colour-coded grid visualising market sentiment across multiple companies — green for bullish, amber for neutral, red for bearish.",
    category: "sentiment",
  },

  /* ── Alert Types ──────────────────────────────────────── */
  "verdict-change": {
    term: "Verdict Change",
    definition:
      "An alert triggered when the AI's investment recommendation changes for a watchlisted company (e.g. from Hold to Buy).",
    category: "metric",
  },
  "sentiment-shift": {
    term: "Sentiment Shift",
    definition:
      "An alert triggered when overall market sentiment around a watchlisted company changes direction (e.g. from Neutral to Bearish).",
    category: "metric",
  },
  "confidence-drop": {
    term: "Confidence Drop",
    definition:
      "An alert triggered when the AI's confidence score for a watchlisted company falls by more than a user-defined threshold.",
    category: "metric",
  },
};

/**
 * Look up a glossary entry by key or partial match.
 * Returns undefined if no match is found.
 */
export function lookupGlossary(key: string): GlossaryEntry | undefined {
  const normalized = key.toLowerCase().replace(/[()]/g, "").replace(/[\s_/]+/g, "-").replace(/-{2,}/g, "-");
  // Try exact match first, then try common aliases
  if (glossary[normalized]) return glossary[normalized];
  // Handle "p-e-ratio" → "pe-ratio" style collapsing (single-letter segments)
  const collapsed = normalized.replace(/-([a-z])-/g, "$1-");
  return glossary[collapsed];
}

/**
 * Get all glossary entries for a given category.
 */
export function getGlossaryByCategory(category: GlossaryEntry["category"]): GlossaryEntry[] {
  return Object.values(glossary).filter((entry) => entry.category === category);
}

/**
 * List of all glossary keys — useful for completeness testing.
 */
export const glossaryKeys = Object.keys(glossary);
