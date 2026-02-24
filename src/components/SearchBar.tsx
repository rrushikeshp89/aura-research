import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <motion.div
        className="relative"
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Outer glow ring */}
        <div
          className={`
            absolute -inset-[2px] rounded-full transition-opacity duration-700
            bg-gradient-to-r from-amber-500/40 via-orange-400/40 to-amber-500/40
            blur-sm
            ${isFocused ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* Main bar */}
        <div
          className={`
            relative flex items-center w-full rounded-full overflow-hidden
            transition-all duration-500
            border backdrop-blur-xl
            ${isFocused
              ? "bg-white/[0.12] border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]"
              : "bg-white/[0.08] border-white/[0.15] shadow-[0_4px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/[0.25] hover:bg-white/[0.10]"
            }
          `}
        >
          {/* Search icon */}
          <div className="flex items-center pl-6 pr-3">
            <motion.div
              animate={{ rotate: isFocused ? 90 : 0, scale: isFocused ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Search className={`h-5 w-5 transition-colors duration-500 ${isFocused ? "text-amber-400" : "text-white/40"}`} />
            </motion.div>
          </div>

          {/* Input */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search any company or ticker..."
            disabled={isLoading}
            className="
              flex-1 h-16 bg-transparent text-white text-base
              placeholder:text-white/30
              outline-none border-none appearance-none
              font-medium tracking-wide
            "
            style={{ fontFamily: "'Inter', sans-serif" }}
          />

          {/* Submit button */}
          <div className="pr-2.5">
            <motion.button
              type="submit"
              disabled={isLoading || !query.trim()}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`
                flex items-center gap-2.5 h-11 px-7 rounded-full text-sm font-bold
                transition-all duration-300 cursor-pointer
                ${isLoading || !query.trim()
                  ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.5)]"
                }
              `}
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="h-4 w-4 border-2 border-white/20 border-t-white/80 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  Research
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </form>
  );
}
