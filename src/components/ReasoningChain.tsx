import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { ReasoningStep } from "@/types/research";

interface ReasoningChainProps {
  chain: ReasoningStep[];
}

const impactConfig = {
  Bullish: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  Bearish: { color: "bg-red-500/20 text-red-400 border-red-500/30" },
  Neutral: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const itemVariant = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export function ReasoningChain({ chain }: ReasoningChainProps) {
  if (!chain || chain.length === 0) return null;

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-amber-500/40 via-amber-500/20 to-transparent" />

      <Accordion type="multiple" defaultValue={[`step-${chain[0]?.step}`]} className="space-y-3">
        {chain.map((step) => {
          const impact = impactConfig[step.impact] || impactConfig.Neutral;

          return (
            <motion.div key={step.step} variants={itemVariant}>
              <AccordionItem value={`step-${step.step}`} className="border-none">
                <AccordionTrigger className="hover:no-underline py-2 px-0 gap-3">
                  <div className="flex items-center gap-3 text-left w-full">
                    {/* Step number badge */}
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold shrink-0">
                      {step.step}
                    </div>

                    {/* Title + impact badge */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground/90 block truncate">
                        {step.title}
                      </span>
                    </div>

                    <Badge variant="outline" className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider ${impact.color}`}>
                      {step.impact}
                    </Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pl-11 pb-4 pt-1">
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                    {step.analysis}
                  </p>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed italic border-l-2 border-amber-500/20 pl-3">
                    {step.evidence}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          );
        })}
      </Accordion>
    </motion.div>
  );
}
