import { describe, it, expect } from "vitest";
import {
  glossary,
  glossaryKeys,
  lookupGlossary,
  getGlossaryByCategory,
  type GlossaryEntry,
} from "@/lib/glossary";

describe("glossary", () => {
  /* ── Completeness: every term the report UI relies on must exist ── */
  describe("completeness", () => {
    const requiredTerms = [
      // Verdicts
      "verdict", "buy", "hold", "sell",
      // Confidence
      "confidence-score", "fundamental-strength", "sentiment-signal", "data-quality", "risk-adjustment",
      // Fundamentals
      "revenue", "earnings", "pe-ratio", "market-cap", "balance-sheet",
      // Sentiment
      "bullish", "neutral", "bearish", "analyst-consensus", "sentiment",
      // Risk
      "risk-factor", "volatility",
      // Sector
      "sector", "sentiment-heatmap",
      // Alerts
      "verdict-change", "sentiment-shift", "confidence-drop",
    ];

    it.each(requiredTerms)("contains required term '%s'", (key) => {
      expect(glossary[key]).toBeDefined();
      expect(glossary[key].term).toBeTruthy();
      expect(glossary[key].definition).toBeTruthy();
    });

    it("has no empty definitions", () => {
      for (const key of glossaryKeys) {
        const entry = glossary[key];
        expect(entry.definition.length).toBeGreaterThan(10);
      }
    });

    it("has no empty terms", () => {
      for (const key of glossaryKeys) {
        expect(glossary[key].term.length).toBeGreaterThan(0);
      }
    });
  });

  /* ── Entry structure ── */
  describe("entry structure", () => {
    it("all entries have a valid category", () => {
      const validCategories = ["fundamental", "sentiment", "risk", "verdict", "metric"];
      for (const key of glossaryKeys) {
        expect(validCategories).toContain(glossary[key].category);
      }
    });

    it("glossaryKeys matches Object.keys(glossary)", () => {
      expect(glossaryKeys).toEqual(Object.keys(glossary));
    });
  });

  /* ── lookupGlossary ── */
  describe("lookupGlossary", () => {
    it("finds exact lowercase key", () => {
      const result = lookupGlossary("revenue");
      expect(result).toBeDefined();
      expect(result!.term).toBe("Revenue");
    });

    it("normalises spaces to hyphens", () => {
      const result = lookupGlossary("confidence score");
      expect(result).toBeDefined();
      expect(result!.term).toBe("Confidence Score");
    });

    it("normalises slashes to hyphens (P/E Ratio → pe-ratio)", () => {
      const result = lookupGlossary("P/E Ratio");
      expect(result).toBeDefined();
      expect(result!.term).toBe("P/E Ratio");
    });

    it("normalises underscores to hyphens", () => {
      const result = lookupGlossary("market_cap");
      expect(result).toBeDefined();
      expect(result!.term).toBe("Market Cap");
    });

    it("returns undefined for unknown term", () => {
      expect(lookupGlossary("nonexistent")).toBeUndefined();
    });

    it("is case-insensitive", () => {
      const result = lookupGlossary("BULLISH");
      expect(result).toBeDefined();
      expect(result!.term).toBe("Bullish");
    });
  });

  /* ── getGlossaryByCategory ── */
  describe("getGlossaryByCategory", () => {
    it("returns only entries of the requested category", () => {
      const verdictEntries = getGlossaryByCategory("verdict");
      expect(verdictEntries.length).toBeGreaterThan(0);
      for (const entry of verdictEntries) {
        expect(entry.category).toBe("verdict");
      }
    });

    it("returns fundamental entries", () => {
      const fundamentals = getGlossaryByCategory("fundamental");
      const terms = fundamentals.map((e) => e.term);
      expect(terms).toContain("Revenue");
      expect(terms).toContain("Market Cap");
    });

    it("returns sentiment entries", () => {
      const sentiments = getGlossaryByCategory("sentiment");
      const terms = sentiments.map((e) => e.term);
      expect(terms).toContain("Bullish");
      expect(terms).toContain("Bearish");
      expect(terms).toContain("Neutral");
    });

    it("returns metric entries including confidence sub-scores", () => {
      const metrics = getGlossaryByCategory("metric");
      const terms = metrics.map((e) => e.term);
      expect(terms).toContain("Confidence Score");
      expect(terms).toContain("Fundamental Strength");
      expect(terms).toContain("Sentiment Signal");
    });
  });
});
