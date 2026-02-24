import { VerdictBadge } from "@/components/VerdictBadge";
import type { ResearchReport } from "@/types/research";

interface ComparisonTableProps {
    reports: ResearchReport[];
}

export function ComparisonTable({ reports }: ComparisonTableProps) {
    if (reports.length < 2) return null;

    const rows: { label: string; values: (string | number | React.ReactNode)[] }[] = [
        {
            label: "Verdict",
            values: reports.map((r) => <VerdictBadge key={r.ticker} verdict={r.verdict} confidence={r.confidenceScore} />),
        },
        {
            label: "Confidence",
            values: reports.map((r) => `${r.confidenceScore}%`),
        },
        {
            label: "Revenue",
            values: reports.map((r) => r.fundamentals?.revenue || "N/A"),
        },
        {
            label: "Earnings",
            values: reports.map((r) => r.fundamentals?.earnings || "N/A"),
        },
        {
            label: "P/E Ratio",
            values: reports.map((r) => r.fundamentals?.peRatio || "N/A"),
        },
        {
            label: "Market Cap",
            values: reports.map((r) => r.fundamentals?.marketCap || "N/A"),
        },
        {
            label: "Sentiment",
            values: reports.map((r) => r.sentimentAnalysis?.overallSentiment || "N/A"),
        },
        {
            label: "Risk Factors",
            values: reports.map((r) => r.riskFactors?.length?.toString() || "0"),
        },
    ];

    // Helper to determine if a numeric-ish confidence is the best in the row
    function confidenceClass(idx: number): string {
        const scores = reports.map((r) => r.confidenceScore);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        if (scores[idx] === max) return "text-green-500 font-semibold";
        if (scores[idx] === min && max !== min) return "text-amber-500";
        return "";
    }

    return (
        <div className="rounded-xl border border-border overflow-hidden bg-card/60 backdrop-blur-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/40">
                        <th className="text-left px-4 py-3 text-muted-foreground font-medium w-[140px]">Metric</th>
                        {reports.map((r) => (
                            <th key={r.ticker} className="text-center px-4 py-3 font-semibold text-foreground">
                                {r.company}
                                <span className="block text-xs text-muted-foreground font-normal">{r.ticker}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, ri) => (
                        <tr key={row.label} className={ri % 2 === 0 ? "" : "bg-muted/20"}>
                            <td className="px-4 py-3 text-muted-foreground font-medium">{row.label}</td>
                            {row.values.map((val, ci) => (
                                <td
                                    key={ci}
                                    className={`px-4 py-3 text-center ${row.label === "Confidence" ? confidenceClass(ci) : ""}`}
                                >
                                    {typeof val === "string" || typeof val === "number" ? (
                                        <span>{val}</span>
                                    ) : (
                                        <div className="flex justify-center">{val}</div>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
