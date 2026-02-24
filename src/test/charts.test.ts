import { describe, it, expect } from "vitest";
import { parseFinancialValue, ParsedValue } from "@/components/charts/FundamentalsChart";

describe("parseFinancialValue", () => {
  /* ── Revenue / Market Cap: dollar + unit word ── */
  describe("dollar + unit word (e.g. $383.29 billion)", () => {
    it("parses '$383.29 billion'", () => {
      const result = parseFinancialValue("$383.29 billion", "revenue");
      expect(result.numBillions).toBeCloseTo(383.29, 1);
      expect(result.compact).toBe("$383B");
    });

    it("parses '$2.8 trillion'", () => {
      const result = parseFinancialValue("$2.8 trillion", "marketCap");
      expect(result.numBillions).toBeCloseTo(2800, 0);
      expect(result.compact).toBe("$2.8T");
    });

    it("parses '$500 million'", () => {
      const result = parseFinancialValue("$500 million", "revenue");
      expect(result.numBillions).toBeCloseTo(0.5, 2);
      expect(result.compact).toBe("$500M");
    });

    it("parses value with commas: '$1,234 billion'", () => {
      const result = parseFinancialValue("$1,234 billion", "revenue");
      expect(result.numBillions).toBeCloseTo(1234, 0);
      expect(result.compact).toBe("$1.2T");
    });
  });

  /* ── P/E Ratio: special number-only extraction ── */
  describe("P/E Ratio (peRatio metric key)", () => {
    it("parses 'Approximately 29.5x'", () => {
      const result = parseFinancialValue("Approximately 29.5x", "peRatio");
      expect(result.numBillions).toBeCloseTo(29.5, 1);
      expect(result.compact).toBe("29.5x");
    });

    it("parses '15.2 (TTM)'", () => {
      const result = parseFinancialValue("15.2 (TTM)", "peRatio");
      expect(result.numBillions).toBeCloseTo(15.2, 1);
      expect(result.compact).toBe("15.2x");
      expect(result.subtitle).toBe("TTM");
    });

    it("parses bare number '22'", () => {
      const result = parseFinancialValue("22", "peRatio");
      expect(result.numBillions).toBe(22);
      expect(result.compact).toBe("22x");
    });
  });

  /* ── Earnings (EPS): dollar without unit ── */
  describe("Earnings / EPS", () => {
    it("parses '$6.13'", () => {
      const result = parseFinancialValue("$6.13", "earnings");
      expect(result.numBillions).toBeCloseTo(6.13, 2);
      expect(result.compact).toBe("$6.13");
    });

    it("parses '$2.95 (FY2023)'", () => {
      const result = parseFinancialValue("$2.95 (FY2023)", "earnings");
      expect(result.numBillions).toBeCloseTo(2.95, 2);
      expect(result.compact).toBe("$2.95");
      expect(result.subtitle).toBe("FY2023");
    });
  });

  /* ── Range formats ── */
  describe("range expressions", () => {
    it("parses '$2.6 - $2.8 trillion'", () => {
      const result = parseFinancialValue("$2.6 - $2.8 trillion", "marketCap");
      expect(result.numBillions).toBeCloseTo(2700, 0);
      expect(result.compact).toBe("$2.7T");
      expect(result.subtitle).toBe("Range estimate");
    });

    it("parses '$350 – $400 billion'", () => {
      const result = parseFinancialValue("$350 – $400 billion", "revenue");
      expect(result.numBillions).toBeCloseTo(375, 0);
      expect(result.compact).toBe("$375.0B");
    });
  });

  /* ── Bare number + unit (no $) ── */
  describe("bare number + unit word", () => {
    it("parses '383.29 billion'", () => {
      const result = parseFinancialValue("383.29 billion", "revenue");
      expect(result.numBillions).toBeCloseTo(383.29, 1);
      expect(result.compact).toBe("$383B");
    });
  });

  /* ── Parenthesised context extraction ── */
  describe("subtitle extraction", () => {
    it("extracts fiscal year from parentheses", () => {
      const result = parseFinancialValue("Approximately $383.29 billion (FY23)", "revenue");
      expect(result.subtitle).toBe("FY23");
    });

    it("returns empty subtitle when no parentheses", () => {
      const result = parseFinancialValue("$100 billion", "revenue");
      expect(result.subtitle).toBe("");
    });
  });

  /* ── Edge cases ── */
  describe("edge cases", () => {
    it("handles unparseable text gracefully", () => {
      const result = parseFinancialValue("Not available", "revenue");
      expect(result.numBillions).toBe(0);
      expect(result.compact).toBe("Not available");
    });

    it("handles empty string", () => {
      const result = parseFinancialValue("", "revenue");
      expect(result.numBillions).toBe(0);
    });
  });
});
