import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { FinancialTooltip } from "@/components/FinancialTooltip";

interface FundamentalsChartProps {
  fundamentals: {
    revenue: string;
    earnings: string;
    peRatio: string;
    marketCap: string;
    balanceSheetHighlights?: string[];
  };
}

/* ── Industry averages (all normalised to billions for comparison) ── */
const INDUSTRY_AVERAGES: Record<string, { avgBillions: number; label: string }> = {
  revenue: { avgBillions: 150, label: "$150B avg" },
  earnings: { avgBillions: 4.5, label: "$4.50 avg EPS" },
  peRatio: { avgBillions: 22, label: "22x avg" },
  marketCap: { avgBillions: 800, label: "$800B avg" },
};

/* ── Robust parser: handles "Approximately $383.29 billion (FY23)" etc ── */
export interface ParsedValue {
  numBillions: number;   // value normalised to billions (or raw for EPS/ratio)
  compact: string;       // short display: "$383.3B", "29x", "$2.7T"
  subtitle: string;      // contextual line shown below the value
}

const UNIT_MULTIPLIERS: Record<string, number> = {
  T: 1000, TRILLION: 1000,
  B: 1, BILLION: 1,
  M: 0.001, MILLION: 0.001,
  K: 0.000001, THOUSAND: 0.000001,
};

export function parseFinancialValue(raw: string, metricKey: string): ParsedValue {
  const text = raw.trim();

  // Extract contextual subtitle from parenthesised text (e.g. "Fiscal Year 2023")
  const fyMatch = text.match(/\(([^)]+)\)/);
  const subtitle = fyMatch ? fyMatch[1].trim() : "";

  // Remove parenthesised text so year numbers don't interfere with value parsing
  const cleaned = text.replace(/\([^)]*\)/g, "").trim();

  // Special case for P/E Ratio — grab the first standalone number
  if (metricKey === "peRatio") {
    const numMatch = cleaned.match(/([\d.]+)/);
    const num = numMatch ? parseFloat(numMatch[1]) : 0;
    return { numBillions: num, compact: `${num}x`, subtitle };
  }

  // Helper: given num + unit key, format the compact display and return parsed value
  function formatResult(num: number, unitKey: string, sub: string): ParsedValue {
    const mult = UNIT_MULTIPLIERS[unitKey] ?? 0;
    if (mult > 0) {
      const inBillions = num * mult;
      let compact: string;
      if (inBillions >= 1000) compact = `$${(inBillions / 1000).toFixed(1)}T`;
      else if (inBillions >= 1) compact = `$${inBillions.toFixed(inBillions >= 100 ? 0 : 1)}B`;
      else compact = `$${(inBillions * 1000).toFixed(0)}M`;
      return { numBillions: inBillions, compact, subtitle: sub };
    }
    // No recognised unit — treat as raw number (EPS etc.)
    if (metricKey === "earnings") {
      return { numBillions: num, compact: `$${num.toFixed(2)}`, subtitle: sub || "EPS" };
    }
    return { numBillions: num, compact: `$${num.toLocaleString()}`, subtitle: sub };
  }

  // 1️⃣  Range: "$2.6 - $2.8 trillion"
  const rangeMatch = cleaned.match(/\$\s*([\d,.]+)\s*[-–—]+\s*\$?\s*([\d,.]+)\s*(trillion|billion|million|T|B|M)/i);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1].replace(/,/g, ""));
    const high = parseFloat(rangeMatch[2].replace(/,/g, ""));
    const unitKey = rangeMatch[3].toUpperCase();
    const mult = UNIT_MULTIPLIERS[unitKey] ?? 1;
    const midVal = (low + high) / 2;
    const inBillions = midVal * mult;
    let compact: string;
    if (mult >= 1000) compact = `$${midVal.toFixed(1)}T`;
    else if (mult >= 1) compact = `$${midVal.toFixed(1)}B`;
    else compact = `$${midVal.toFixed(1)}M`;
    return { numBillions: inBillions, compact, subtitle: subtitle || "Range estimate" };
  }

  // 2️⃣  Dollar + number + unit word:  "$383.29 billion", "$2.8 trillion"
  const dollarUnitMatch = cleaned.match(/\$\s*([\d,.]+)\s*(trillion|billion|million|thousand|T|B|M|K)/i);
  if (dollarUnitMatch) {
    const num = parseFloat(dollarUnitMatch[1].replace(/,/g, ""));
    return formatResult(num, dollarUnitMatch[2].toUpperCase(), subtitle);
  }

  // 3️⃣  Bare number + unit word (no $):  "383.29 billion", "2.8 trillion"
  const bareUnitMatch = cleaned.match(/([\d,.]+)\s*(trillion|billion|million|thousand)/i);
  if (bareUnitMatch) {
    const num = parseFloat(bareUnitMatch[1].replace(/,/g, ""));
    return formatResult(num, bareUnitMatch[2].toUpperCase(), subtitle);
  }

  // 4️⃣  Dollar + number (no unit):  "$6.13" (EPS), "$383"
  const dollarOnly = cleaned.match(/\$\s*([\d,.]+)/);
  if (dollarOnly) {
    const num = parseFloat(dollarOnly[1].replace(/,/g, ""));
    return formatResult(num, "", subtitle);
  }

  // 5️⃣  Last resort — first bare number
  const bareNum = cleaned.match(/([\d,.]+)/);
  if (bareNum) {
    const num = parseFloat(bareNum[1].replace(/,/g, ""));
    return formatResult(num, "", subtitle);
  }

  return { numBillions: 0, compact: text.slice(0, 20), subtitle };
}

/* ── Sparkline path generator ── */
function generateSparkline(seed: number, points: number = 14): string {
  const values: number[] = [];
  let v = 40 + (seed * 17) % 20;
  for (let i = 0; i < points; i++) {
    v += Math.sin(seed + i * 0.7) * 8 + Math.cos(seed * i * 0.3) * 4;
    v = Math.max(10, Math.min(70, v));
    values.push(v);
  }
  const step = 100 / (points - 1);
  return values.map((y, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(80 - y).toFixed(1)}`).join(" ");
}

/* ── Metric card config ── */
interface MetricConfig {
  key: string;
  label: string;
  glossaryKey: string;
  category: string;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  sparkColor: string;
  accentRing: string;
  size: "large" | "small";
}

const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: "revenue",
    label: "Revenue",
    glossaryKey: "revenue",
    category: "MACRO",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-blue-500/20 via-blue-400/8 to-cyan-500/5",
    glowColor: "rgba(59, 130, 246, 0.12)",
    sparkColor: "#3b82f6",
    accentRing: "#60a5fa",
    size: "large",
  },
  {
    key: "marketCap",
    label: "Market Cap",
    glossaryKey: "market-cap",
    category: "MACRO",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7M3 7l9-4 9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-violet-500/20 via-purple-400/8 to-fuchsia-500/5",
    glowColor: "rgba(139, 92, 246, 0.12)",
    sparkColor: "#8b5cf6",
    accentRing: "#a78bfa",
    size: "large",
  },
  {
    key: "earnings",
    label: "Earnings (EPS)",
    glossaryKey: "earnings",
    category: "PERFORMANCE",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-emerald-500/20 via-green-400/8 to-teal-500/5",
    glowColor: "rgba(16, 185, 129, 0.12)",
    sparkColor: "#10b981",
    accentRing: "#34d399",
    size: "small",
  },
  {
    key: "peRatio",
    label: "P/E Ratio",
    glossaryKey: "pe-ratio",
    category: "PERFORMANCE",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    gradient: "from-amber-500/20 via-orange-400/8 to-yellow-500/5",
    glowColor: "rgba(245, 158, 11, 0.12)",
    sparkColor: "#f59e0b",
    accentRing: "#fbbf24",
    size: "small",
  },
];

/* ── Benchmark ring ── */
function BenchmarkRing({ ratio, color, expanded }: { ratio: number; color: string; expanded: boolean }) {
  const clampedRatio = Math.min(ratio, 3);
  const circumference = 2 * Math.PI * 28;
  const fillFraction = Math.min(clampedRatio / 3, 1); // 3x = full circle
  const strokeDash = fillFraction * circumference;

  const displayLabel = ratio >= 1
    ? `${ratio.toFixed(1)}x`
    : ratio > 0
      ? `${(ratio * 100).toFixed(0)}%`
      : "—";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: expanded ? 1 : 0, scale: expanded ? 1 : 0.6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex-shrink-0"
    >
      <svg width="64" height="64" viewBox="0 0 64 64">
        {/* Track ring */}
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground/10" />
        {/* Value arc */}
        <motion.circle
          cx="32" cy="32" r="28" fill="none"
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          transform="rotate(-90 32 32)"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${strokeDash} ${circumference}` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Center text */}
        <text x="32" y="30" textAnchor="middle" className="fill-foreground" style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
          {displayLabel}
        </text>
        <text x="32" y="42" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 7, fontFamily: "'Inter', sans-serif" }}>
          vs avg
        </text>
      </svg>
    </motion.div>
  );
}

/* ═══════════════════════════  MAIN COMPONENT  ═══════════════════════════ */
export function FundamentalsChart({ fundamentals }: FundamentalsChartProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const parsed = useMemo(() => ({
    revenue: parseFinancialValue(fundamentals.revenue, "revenue"),
    earnings: parseFinancialValue(fundamentals.earnings, "earnings"),
    peRatio: parseFinancialValue(fundamentals.peRatio, "peRatio"),
    marketCap: parseFinancialValue(fundamentals.marketCap, "marketCap"),
  }), [fundamentals]);

  const sparklines = useMemo(() => ({
    revenue: generateSparkline(1),
    earnings: generateSparkline(2),
    peRatio: generateSparkline(3),
    marketCap: generateSparkline(4),
  }), []);

  return (
    <div className="space-y-4">
      {/* Pulsing ambient backdrop */}
      <div className="relative rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3"
          style={{ animation: "pulse 4s ease-in-out infinite" }}
        />

        {/* ── Bento Grid ── */}
        <div className="relative grid grid-cols-2 gap-3 p-1">
          {METRIC_CONFIGS.map((config, i) => {
            const val = parsed[config.key as keyof typeof parsed];
            const avg = INDUSTRY_AVERAGES[config.key];
            const isExpanded = expandedCard === config.key;
            const isLarge = config.size === "large";
            const ratio = val.numBillions > 0 ? val.numBillions / Math.max(avg.avgBillions, 0.01) : 0;

            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onHoverStart={() => setExpandedCard(config.key)}
                onHoverEnd={() => setExpandedCard(null)}
                className={`
                  group relative overflow-hidden rounded-xl cursor-pointer
                  transition-all duration-300 ease-out
                  ${isLarge ? "col-span-2 sm:col-span-1" : "col-span-1"}
                  ${isExpanded ? "ring-1 ring-primary/20 shadow-lg" : "shadow-sm hover:shadow-md"}
                `}
                style={{ minHeight: isLarge ? 170 : 140 }}
              >
                {/* ▸ Glass layers */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}
                  style={{ boxShadow: `inset 0 0 80px ${config.glowColor}` }}
                />
                <div className="absolute inset-0 bg-card/75 backdrop-blur-md border border-white/[0.06] rounded-xl" />

                {/* ▸ Sparkline background */}
                <div className="absolute inset-0 opacity-[0.10] group-hover:opacity-[0.18] transition-opacity duration-500">
                  <svg width="100%" height="100%" viewBox="0 0 100 80" preserveAspectRatio="none">
                    <motion.path
                      d={sparklines[config.key as keyof typeof sparklines]}
                      fill="none" stroke={config.sparkColor} strokeWidth="1.5" strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.path
                      d={`${sparklines[config.key as keyof typeof sparklines]} L 100 80 L 0 80 Z`}
                      fill={config.sparkColor} opacity="0.06"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.06 }}
                      transition={{ duration: 1, delay: 1.2 }}
                    />
                  </svg>
                </div>

                {/* ▸ Card content */}
                <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                  {/* Top row: category + label + shimmer dot */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm"
                        style={{
                          color: config.sparkColor,
                          backgroundColor: `${config.sparkColor}15`,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {config.category}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-muted-foreground/70">{config.icon}</span>
                        <span className="text-xs font-medium text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
                          <FinancialTooltip term={config.glossaryKey} showIcon={false}>{config.label}</FinancialTooltip>
                        </span>
                      </div>
                    </div>

                    {/* Shimmer dot — CSS animation (avoids framer-motion RAF jank on tab switch) */}
                    <motion.div className="relative h-2 w-2 rounded-full" style={{ backgroundColor: config.sparkColor }}>
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundColor: config.sparkColor,
                          animation: `shimmer-dot 3s ease-in-out infinite ${i * 0.5}s`,
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Bottom: compact value + benchmark */}
                  <div className="mt-auto flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <motion.p
                        className="font-bold text-foreground leading-none truncate"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: isLarge ? "1.5rem" : "1.25rem",
                          letterSpacing: "-0.03em",
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {val.compact}
                      </motion.p>

                      {/* Subtitle (fiscal year, etc) */}
                      {val.subtitle && (
                        <motion.span
                          className="text-[10px] text-muted-foreground/50 mt-1 block"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                        >
                          {val.subtitle}
                        </motion.span>
                      )}

                      {/* Benchmark bar on hover */}
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.06]">
                          <div className="h-1.5 rounded-full flex-1 bg-muted/20 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: config.sparkColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(ratio * 40, 100)}%` }}
                              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                          <span
                            className="text-[10px] text-muted-foreground/50 whitespace-nowrap font-medium"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {avg.label}
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Benchmark ring (large cards only, on hover) */}
                    {isLarge && (
                      <BenchmarkRing ratio={ratio} color={config.accentRing} expanded={isExpanded} />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Balance Sheet Highlights ── */}
      {fundamentals.balanceSheetHighlights && fundamentals.balanceSheetHighlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-xl border border-white/[0.06] bg-card/50 backdrop-blur-sm p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
            Balance Sheet Highlights
          </p>
          <div className="flex flex-wrap gap-2">
            {fundamentals.balanceSheetHighlights.map((h, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-white/[0.04]"
              >
                {h}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
