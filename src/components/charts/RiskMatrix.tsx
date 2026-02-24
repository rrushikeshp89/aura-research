import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";

interface RiskMatrixProps {
  risks: string[];
}

const severityConfig = [
  { icon: ShieldAlert, color: "hsl(0, 72%, 51%)", bgColor: "hsla(0, 72%, 51%, 0.08)", borderColor: "hsla(0, 72%, 51%, 0.2)", label: "High" },
  { icon: AlertTriangle, color: "hsl(38, 92%, 50%)", bgColor: "hsla(38, 92%, 50%, 0.08)", borderColor: "hsla(38, 92%, 50%, 0.2)", label: "Medium" },
  { icon: Info, color: "hsl(217, 91%, 60%)", bgColor: "hsla(217, 91%, 60%, 0.08)", borderColor: "hsla(217, 91%, 60%, 0.2)", label: "Low" },
];

export function RiskMatrix({ risks }: RiskMatrixProps) {
  return (
    <div className="space-y-2">
      {risks.map((risk, i) => {
        // Assign severity cyclically to create visual hierarchy
        const config = severityConfig[Math.min(i, severityConfig.length - 1)];
        const Icon = config.icon;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group flex items-start gap-3 rounded-lg p-3 border transition-all duration-300 cursor-default hover:scale-[1.01] hover:shadow-md"
            style={{
              backgroundColor: config.bgColor,
              borderColor: config.borderColor,
            }}
          >
            <div
              className="mt-0.5 rounded-md p-1.5 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${config.color}1a` }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-relaxed">{risk}</p>
            </div>
            <span
              className="text-[9px] font-bold uppercase tracking-widest mt-1 shrink-0 opacity-60"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
