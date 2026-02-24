import { motion, AnimatePresence } from "framer-motion";
import { Search, BarChart3, CheckCircle2, Zap } from "lucide-react";
import type { AgentStep } from "@/types/research";

interface AgentActivityFeedProps {
  steps: AgentStep[];
}

/* ── Pulsing ring that radiates outward from the agent icon ── */
function PulseRing({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ border: `2px solid ${color}` }}
      initial={{ scale: 1, opacity: 0.6 }}
      animate={{ scale: 2.2, opacity: 0 }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

/* ── Animated spinner ring for running state ── */
function SpinnerArc({ color }: { color: string }) {
  return (
    <motion.svg
      width={20} height={20} viewBox="0 0 20 20"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      className="shrink-0"
    >
      <circle cx="10" cy="10" r="8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="30 20" opacity="0.7" />
    </motion.svg>
  );
}

/* ── Main exported component ── */
export function AgentActivityFeed({ steps }: AgentActivityFeedProps) {
  if (steps.length === 0) return null;

  const getAgentConfig = (agent: string, status: string) => {
    if (agent === "researcher") return {
      icon: Search,
      label: "Researcher",
      color: "rgb(245, 158, 11)",         // amber
      bgColor: "rgba(245, 158, 11, 0.1)",
      borderColor: status === "running" ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.12)",
      glowColor: "rgba(245, 158, 11, 0.15)",
    };
    return {
      icon: BarChart3,
      label: "Analyst",
      color: "rgb(34, 197, 94)",          // green
      bgColor: "rgba(34, 197, 94, 0.1)",
      borderColor: status === "running" ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.12)",
      glowColor: "rgba(34, 197, 94, 0.15)",
    };
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-5"
      >
        <div className="relative flex items-center justify-center w-6 h-6">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <motion.div
            className="absolute inset-0 rounded-full bg-amber-400/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Agent Activity</span>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[23px] top-4 bottom-4 w-px">
          <div className="h-full bg-gradient-to-b from-amber-500/30 via-green-500/20 to-transparent" />
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {steps.map((step, index) => {
              const config = getAgentConfig(step.agent, step.status);
              const Icon = config.icon;
              const isRunning = step.status === "running";
              const isLatest = index === steps.length - 1;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                    delay: index * 0.08,
                  }}
                  className="relative flex items-start gap-4 pl-1"
                >
                  {/* Timeline node */}
                  <div className="relative z-10 shrink-0 mt-1">
                    <motion.div
                      className="relative flex items-center justify-center w-[46px] h-[46px] rounded-full"
                      style={{
                        background: config.bgColor,
                        boxShadow: isRunning ? `0 0 20px ${config.glowColor}` : "none",
                      }}
                      animate={isRunning ? {
                        boxShadow: [
                          `0 0 10px ${config.glowColor}`,
                          `0 0 25px ${config.glowColor}`,
                          `0 0 10px ${config.glowColor}`,
                        ],
                      } : {}}
                      transition={isRunning ? { duration: 2, repeat: Infinity } : {}}
                    >
                      {isRunning && <PulseRing color={config.color} />}
                      <Icon className="h-5 w-5" style={{ color: config.color }} />
                    </motion.div>
                  </div>

                  {/* Card content */}
                  <motion.div
                    className="flex-1 min-w-0 rounded-xl p-4 relative overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${config.borderColor}`,
                      backdropFilter: "blur(12px)",
                    }}
                    whileHover={{ scale: 1.01, y: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {/* Subtle gradient shimmer on active card */}
                    {isRunning && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${config.glowColor}, transparent)`,
                        }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Agent label */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.15em]"
                            style={{ color: config.color }}
                          >
                            {config.label}
                          </span>
                          {isLatest && isRunning && (
                            <motion.span
                              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ background: config.bgColor, color: config.color }}
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              Live
                            </motion.span>
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-sm text-white/80 leading-relaxed">
                          {step.message}
                        </p>
                      </div>

                      {/* Status indicator */}
                      <div className="shrink-0">
                        {isRunning ? (
                          <SpinnerArc color={config.color} />
                        ) : (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                          >
                            <CheckCircle2 className="h-5 w-5" style={{ color: config.color }} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
