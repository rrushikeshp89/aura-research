import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ResearchReport } from "@/types/research";

interface ComparisonChartProps {
    reports: ResearchReport[];
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

function sentimentToScore(sentiment: string): number {
    switch (sentiment) {
        case "Bullish": return 80;
        case "Neutral": return 50;
        case "Bearish": return 20;
        default: return 0;
    }
}

export function ComparisonChart({ reports }: ComparisonChartProps) {
    if (reports.length < 2) return null;

    const data = [
        {
            metric: "Confidence",
            ...Object.fromEntries(reports.map((r) => [r.ticker, r.confidenceScore])),
        },
        {
            metric: "Sentiment",
            ...Object.fromEntries(reports.map((r) => [r.ticker, sentimentToScore(r.sentimentAnalysis?.overallSentiment || "")])),
        },
        {
            metric: "Risk Score",
            ...Object.fromEntries(reports.map((r) => [r.ticker, Math.max(0, 100 - (r.riskFactors?.length || 0) * 20)])),
        },
    ];

    return (
        <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Score Comparison
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="metric" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {reports.map((r, i) => (
                        <Bar key={r.ticker} dataKey={r.ticker} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
