import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, ShieldCheck, BarChart3, Zap } from "lucide-react";
import type { WatchlistItem } from "@/hooks/useWatchlist";

interface PortfolioSummaryProps {
    items: WatchlistItem[];
}

const VERDICT_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    Buy: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "Buy" },
    Hold: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Hold" },
    Sell: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Sell" },
};

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Stat card with icon, value, and label ── */
function StatCard({
    icon: Icon,
    label,
    value,
    subtitle,
    color,
    delay = 0,
}: {
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    label: string;
    value: string;
    subtitle?: string;
    color: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay }}
            className="glass-card p-5 flex flex-col gap-3"
        >
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {label}
                </span>
                <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ background: `${color}15` }}
                >
                    <Icon className="h-4 w-4" style={{ color }} />
                </div>
            </div>
            <div>
                <span className="text-3xl font-black tracking-tight text-white">{value}</span>
                {subtitle && (
                    <p className="text-xs text-white/40 mt-1">{subtitle}</p>
                )}
            </div>
        </motion.div>
    );
}

/* ── Animated confidence ring (SVG) ── */
function ConfidenceRing({ score, size = 100 }: { score: number; size?: number }) {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * score) / 100;
    const color = score > 70 ? "#22c55e" : score > 40 ? "#f59e0b" : "#ef4444";

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-2xl font-black text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, ease }}
                >
                    {score}%
                </motion.span>
            </div>
        </div>
    );
}

export function PortfolioSummary({ items }: PortfolioSummaryProps) {
    if (items.length < 2) return null;

    // Compute metrics
    const verdictCounts: Record<string, number> = { Buy: 0, Hold: 0, Sell: 0 };
    items.forEach((i) => { verdictCounts[i.verdict]++; });
    const verdictData = Object.entries(verdictCounts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }));

    const avgConfidence = Math.round(
        items.reduce((sum, i) => sum + i.confidenceScore, 0) / items.length
    );

    const sentimentCounts = { Bullish: 0, Neutral: 0, Bearish: 0 };
    items.forEach((i) => {
        const s = i.report?.sentimentAnalysis?.overallSentiment;
        if (s && s in sentimentCounts) sentimentCounts[s as keyof typeof sentimentCounts]++;
    });

    const dominantVerdict = verdictData.reduce((a, b) => (a.value >= b.value ? a : b));
    const dominantSentiment = Object.entries(sentimentCounts).reduce((a, b) =>
        a[1] >= b[1] ? a : b
    );

    const sentimentColors: Record<string, string> = {
        Bullish: "#22c55e",
        Neutral: "#f59e0b",
        Bearish: "#ef4444",
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-5xl mx-auto space-y-6"
        >
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
            >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
                    <Zap className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">Portfolio Overview</h2>
                    <p className="text-xs text-white/30">{items.length} companies tracked</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-4" />
            </motion.div>

            {/* Top stat cards row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={ShieldCheck}
                    label="Avg Confidence"
                    value={`${avgConfidence}%`}
                    subtitle={avgConfidence > 70 ? "Strong conviction" : avgConfidence > 40 ? "Moderate" : "Low conviction"}
                    color="#22c55e"
                    delay={0}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Top Verdict"
                    value={dominantVerdict.name}
                    subtitle={`${dominantVerdict.value} of ${items.length} companies`}
                    color={VERDICT_CONFIG[dominantVerdict.name]?.color || "#f59e0b"}
                    delay={0.08}
                />
                <StatCard
                    icon={BarChart3}
                    label="Market Mood"
                    value={dominantSentiment[0]}
                    subtitle={`${dominantSentiment[1]} of ${items.length} analyses`}
                    color={sentimentColors[dominantSentiment[0]] || "#f59e0b"}
                    delay={0.16}
                />
                <StatCard
                    icon={Zap}
                    label="Portfolio Size"
                    value={`${items.length}`}
                    subtitle="Companies watched"
                    color="#f59e0b"
                    delay={0.24}
                />
            </div>

            {/* Bottom detail row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Verdict Donut */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease, delay: 0.3 }}
                    className="glass-card p-5"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4 block">
                        Verdict Split
                    </span>
                    <div className="flex items-center gap-6">
                        <div className="h-[100px] w-[100px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={verdictData}
                                        dataKey="value"
                                        innerRadius={30}
                                        outerRadius={46}
                                        paddingAngle={4}
                                        strokeWidth={0}
                                    >
                                        {verdictData.map((entry) => (
                                            <Cell key={entry.name} fill={VERDICT_CONFIG[entry.name]?.color || "#666"} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {["Buy", "Hold", "Sell"].map((v) => {
                                const count = verdictCounts[v] || 0;
                                const cfg = VERDICT_CONFIG[v];
                                return (
                                    <div key={v} className="flex items-center gap-2.5">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: cfg.color }}
                                        />
                                        <span className="text-xs text-white/60 w-8">{cfg.label}</span>
                                        <span className="text-sm font-bold text-white">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Confidence Ring */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease, delay: 0.38 }}
                    className="glass-card p-5 flex flex-col items-center justify-center"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">
                        Confidence Score
                    </span>
                    <ConfidenceRing score={avgConfidence} size={110} />
                    <span className="text-[10px] font-medium text-white/30 mt-3 uppercase tracking-widest">
                        {avgConfidence > 70 ? "Strong" : avgConfidence > 40 ? "Moderate" : "Weak"}
                    </span>
                </motion.div>

                {/* Sentiment Bars */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease, delay: 0.46 }}
                    className="glass-card p-5"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4 block">
                        Sentiment Breakdown
                    </span>
                    <div className="space-y-4 mt-2">
                        {(["Bullish", "Neutral", "Bearish"] as const).map((label) => {
                            const count = sentimentCounts[label];
                            const pct = items.length > 0 ? (count / items.length) * 100 : 0;
                            const barColor = sentimentColors[label];
                            return (
                                <div key={label} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white/50">{label}</span>
                                        <span className="text-xs font-bold text-white">{count}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: barColor }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, ease, delay: 0.5 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
