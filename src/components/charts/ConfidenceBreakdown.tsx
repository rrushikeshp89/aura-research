import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { FinancialTooltip } from "@/components/FinancialTooltip";
import type { ConfidenceBreakdown as ConfidenceBreakdownType } from "@/types/research";

interface ConfidenceBreakdownProps {
  breakdown: ConfidenceBreakdownType;
}

function getBarColor(value: number): string {
  if (value >= 70) return "bg-emerald-500";
  if (value >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function getBarTrackColor(value: number): string {
  if (value >= 70) return "bg-emerald-500/15";
  if (value >= 40) return "bg-amber-500/15";
  return "bg-red-500/15";
}

function getLabelColor(value: number): string {
  if (value >= 70) return "text-emerald-400";
  if (value >= 40) return "text-amber-400";
  return "text-red-400";
}

export function ConfidenceBreakdown({ breakdown }: ConfidenceBreakdownProps) {
  const radarData = [
    { axis: "Fundamentals", value: breakdown.fundamentalStrength },
    { axis: "Sentiment", value: breakdown.sentimentSignal },
    { axis: "Data Quality", value: breakdown.dataQuality },
    { axis: "Risk Adj.", value: breakdown.riskAdjustment },
  ];

  const bars = [
    { label: "Fundamental Strength", glossaryKey: "fundamental-strength", value: breakdown.fundamentalStrength },
    { label: "Sentiment Signal", glossaryKey: "sentiment-signal", value: breakdown.sentimentSignal },
    { label: "Data Quality", glossaryKey: "data-quality", value: breakdown.dataQuality },
    { label: "Risk Adjustment", glossaryKey: "risk-adjustment", value: breakdown.riskAdjustment },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-[220px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Confidence"
                dataKey="value"
                stroke="rgb(245, 158, 11)"
                fill="rgb(245, 158, 11)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Progress Bars */}
        <div className="space-y-3">
          {bars.map((bar, i) => (
            <motion.div
              key={bar.label}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground font-medium">
                  <FinancialTooltip term={bar.glossaryKey} showIcon={false}>{bar.label}</FinancialTooltip>
                </span>
                <span className={`text-xs font-bold tabular-nums ${getLabelColor(bar.value)}`}>
                  {bar.value}
                </span>
              </div>
              <div className={`h-2 rounded-full ${getBarTrackColor(bar.value)}`}>
                <motion.div
                  className={`h-full rounded-full ${getBarColor(bar.value)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {breakdown.explanation && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground/70 leading-relaxed italic"
        >
          {breakdown.explanation}
        </motion.p>
      )}
    </div>
  );
}
