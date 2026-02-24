import { ConfidenceGauge } from "@/components/charts/ConfidenceGauge";
import { SentimentMeter } from "@/components/charts/SentimentMeter";
import { FundamentalsChart } from "@/components/charts/FundamentalsChart";
import { RiskMatrix } from "@/components/charts/RiskMatrix";
import { ConfidenceBreakdown } from "@/components/charts/ConfidenceBreakdown";
import { ReasoningChain } from "@/components/ReasoningChain";
import { VerdictBadge } from "@/components/VerdictBadge";
import { FinancialTooltip } from "@/components/FinancialTooltip";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, TrendingUp, Building2, BarChart3, AlertTriangle, Brain, ListOrdered } from "lucide-react";
import { motion } from "framer-motion";
import type { ResearchReport } from "@/types/research";
import { forwardRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReportPanelProps {
  report: ResearchReport;
}

const ease = [0.16, 1, 0.3, 1] as const;

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease },
};

/* ── Section wrapper with glass styling ── */
function GlassSection({ children, className = "", delay = 0, mobilePadding = false }: { children: React.ReactNode; className?: string; delay?: number; mobilePadding?: boolean }) {
  return (
    <motion.div
      {...fadeIn}
      transition={{ ...fadeIn.transition, delay }}
    >
      <div className={`glass-card ${mobilePadding ? 'p-4 md:p-6' : 'p-6'} ${className}`}>
        {children}
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title, glossaryKey }: { icon: React.ComponentType<{ className?: string }>; title: string; glossaryKey?: string }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-amber-400/70 mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4" />
      {glossaryKey ? (
        <FinancialTooltip term={glossaryKey} showIcon={false}>{title}</FinancialTooltip>
      ) : (
        title
      )}
    </h2>
  );
}

export const ReportPanel = forwardRef<HTMLDivElement, ReportPanelProps>(
  function ReportPanel({ report }, ref) {
    const isMobile = useIsMobile();

    /* Helper: wraps content in an AccordionItem on mobile, renders directly on desktop */
    const MobileAccordionWrap = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) => {
      if (!isMobile) return <>{children}</>;
      return (
        <AccordionItem value={id} className="border-none">
          <AccordionTrigger className="hover:no-underline py-0">
            <SectionHeader icon={Icon} title={title} />
          </AccordionTrigger>
          <AccordionContent className="pt-2">{children}</AccordionContent>
        </AccordionItem>
      );
    };

    const reportContent = (
      <>
        {/* ── Hero Header ── */}
        <motion.div {...fadeIn} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{report.company}</h1>
              <span className="font-mono text-sm text-amber-400/70 glass px-3 py-1 rounded-full">
                {report.ticker}
              </span>
            </div>
            <VerdictBadge verdict={report.verdict} confidence={report.confidenceScore} size="lg" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <ConfidenceGauge score={report.confidenceScore} size={isMobile ? 110 : 140} />
          </motion.div>
        </motion.div>

        {/* ── Confidence Breakdown ── */}
        {report.confidenceBreakdown && (
          <GlassSection delay={0.1} mobilePadding>
            <SectionHeader icon={Brain} title="Confidence Breakdown" glossaryKey="confidence-score" />
            <ConfidenceBreakdown breakdown={report.confidenceBreakdown} />
          </GlassSection>
        )}

        {/* ── Executive Summary ── */}
        <GlassSection delay={0.15} mobilePadding className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500 rounded-l" />
          <SectionHeader icon={TrendingUp} title="Executive Summary" />
          <p className="text-sm text-foreground/90 leading-relaxed pl-3">{report.executiveSummary}</p>
        </GlassSection>

        {/* ── AI Reasoning Chain ── */}
        {report.reasoningChain && report.reasoningChain.length > 0 && (
          <GlassSection delay={0.2} mobilePadding>
            <MobileAccordionWrap id="reasoning" title="AI Reasoning Chain" icon={ListOrdered}>
              {!isMobile && <SectionHeader icon={ListOrdered} title="AI Reasoning Chain" glossaryKey="verdict" />}
              <ReasoningChain chain={report.reasoningChain} />
            </MobileAccordionWrap>
          </GlassSection>
        )}

        {/* ── Fundamentals ── */}
        <GlassSection delay={0.3} mobilePadding>
          <MobileAccordionWrap id="fundamentals" title="Fundamentals" icon={Building2}>
            {!isMobile && <SectionHeader icon={Building2} title="Fundamentals" glossaryKey="fundamental-strength" />}
            <div className="min-h-[200px] touch-pan-x overflow-x-auto">
              <FundamentalsChart fundamentals={report.fundamentals} />
            </div>
          </MobileAccordionWrap>
        </GlassSection>

        {/* ── Market Sentiment ── */}
        <GlassSection delay={0.4} mobilePadding>
          <MobileAccordionWrap id="sentiment" title="Market Sentiment" icon={BarChart3}>
            {!isMobile && <SectionHeader icon={BarChart3} title="Market Sentiment" glossaryKey="sentiment" />}
            <SentimentMeter sentiment={report.sentimentAnalysis.overallSentiment} />
            <Separator className="my-4 bg-white/[0.06]" />
            <p className="text-sm text-foreground/90 leading-relaxed">{report.sentimentAnalysis.newsSummary}</p>
            <Separator className="my-3 bg-white/[0.06]" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground/80"><FinancialTooltip term="analyst-consensus" showIcon={false}>Analyst Consensus:</FinancialTooltip></strong> {report.sentimentAnalysis.analystConsensus}
            </p>
          </MobileAccordionWrap>
        </GlassSection>

        {/* ── Risk Factors ── */}
        <GlassSection delay={0.5} mobilePadding>
          <MobileAccordionWrap id="risk" title="Risk Factors" icon={AlertTriangle}>
            {!isMobile && <SectionHeader icon={AlertTriangle} title="Risk Factors" glossaryKey="risk-factor" />}
            <RiskMatrix risks={report.riskFactors} />
          </MobileAccordionWrap>
        </GlassSection>

        {/* ── Sources & Citations ── */}
        <GlassSection delay={0.6} mobilePadding>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-amber-400/70 mb-3">
            Sources & Citations
          </h2>
          <ul className="space-y-1.5">
            {report.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400/80 hover:text-amber-300 hover:underline inline-flex items-center gap-1.5 transition-colors"
                >
                  {s.title} <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </GlassSection>
      </>
    );

    return (
      <div ref={ref} className="space-y-4 md:space-y-6 overflow-y-auto pr-2 pb-12">
        {isMobile ? (
          <Accordion type="multiple" defaultValue={["reasoning", "fundamentals", "sentiment", "risk"]}>
            {reportContent}
          </Accordion>
        ) : (
          reportContent
        )}
      </div>
    );
  }
);
