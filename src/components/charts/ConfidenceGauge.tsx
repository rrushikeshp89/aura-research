import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfidenceGaugeProps {
  score: number; // 0-100
  size?: number;
}

export function ConfidenceGauge({ score, size = 160 }: ConfidenceGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° arc
  const strokeDashoffset = arcLength - (arcLength * animatedScore) / 100;

  const getColor = (val: number) => {
    if (val >= 70) return { stroke: "hsl(152, 69%, 41%)", label: "Strong" };
    if (val >= 40) return { stroke: "hsl(38, 92%, 50%)", label: "Moderate" };
    return { stroke: "hsl(0, 72%, 51%)", label: "Weak" };
  };

  const { stroke, label } = getColor(score);
  const center = size / 2;
  // SVG viewBox is larger than the gauge to give the glow room to spread
  const pad = 40;
  const vbSize = size + pad * 2;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`${-pad} ${-pad} ${vbSize} ${vbSize}`}
        className="relative z-10 -rotate-[135deg] overflow-visible"
      >
        <defs>
          {/* SVG Gaussian blur filter — glow follows the arc shape naturally */}
          <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          className="opacity-40"
        />

        {/* Active arc with built-in SVG glow */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          filter="url(#arc-glow)"
        />
      </svg>

      {/* Center label */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.span
          className="text-3xl font-bold font-mono tabular-nums"
          style={{ color: stroke }}
          key={score}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {score}%
        </motion.span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">
          {label}
        </span>
      </motion.div>
    </div>
  );
}
