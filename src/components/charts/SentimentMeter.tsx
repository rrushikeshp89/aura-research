import { motion } from "framer-motion";

type Sentiment = "Bullish" | "Neutral" | "Bearish";

interface SentimentMeterProps {
  sentiment: Sentiment;
  className?: string;
}

const sentimentConfig: Record<Sentiment, { position: number; color: string; glow: string }> = {
  Bearish: { position: 15, color: "hsl(0, 72%, 51%)", glow: "hsla(0, 72%, 51%, 0.35)" },
  Neutral: { position: 50, color: "hsl(38, 92%, 50%)", glow: "hsla(38, 92%, 50%, 0.35)" },
  Bullish: { position: 85, color: "hsl(152, 69%, 41%)", glow: "hsla(152, 69%, 41%, 0.35)" },
};

export function SentimentMeter({ sentiment, className = "" }: SentimentMeterProps) {
  const config = sentimentConfig[sentiment];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Labels */}
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Bearish</span>
        <span>Neutral</span>
        <span>Bullish</span>
      </div>

      {/* Track */}
      <div className="relative h-3 rounded-full overflow-hidden bg-secondary/60">
        {/* Gradient background */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: "linear-gradient(90deg, hsl(0, 72%, 51%), hsl(38, 92%, 50%), hsl(152, 69%, 41%))",
          }}
        />

        {/* Active fill */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${config.position}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{
            background: `linear-gradient(90deg, ${
              sentiment === "Bearish"
                ? config.color
                : sentiment === "Neutral"
                  ? "hsl(0, 72%, 51%), hsl(38, 92%, 50%)"
                  : "hsl(0, 72%, 51%), hsl(38, 92%, 50%), hsl(152, 69%, 41%)"
            })`,
          }}
        />

        {/* Indicator dot */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-background shadow-lg z-10"
          initial={{ left: "0%", opacity: 0, scale: 0 }}
          animate={{ left: `${config.position}%`, opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{
            backgroundColor: config.color,
            boxShadow: `0 0 12px ${config.glow}, 0 2px 8px rgba(0,0,0,0.3)`,
            marginLeft: "-10px",
          }}
        />
      </div>

      {/* Sentiment label */}
      <motion.div
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-xs font-semibold" style={{ color: config.color }}>
          {sentiment}
        </span>
      </motion.div>
    </div>
  );
}
