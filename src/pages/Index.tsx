import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/SearchBar";
import { AgentActivityFeed } from "@/components/AgentActivityFeed";
import { ResearchHistory } from "@/components/ResearchHistory";
import { ReportPanel } from "@/components/ReportPanel";
import { ExportToolbar } from "@/components/ExportToolbar";
import { UserMenu } from "@/components/UserMenu";
import { WatchlistPanel } from "@/components/WatchlistPanel";
import { AddToWatchlistButton } from "@/components/AddToWatchlistButton";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { useResearch } from "@/hooks/useResearch";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAlerts } from "@/hooks/useAlerts";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Menu, Home, Search, Eye, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ResearchReport } from "@/types/research";
import type { WatchlistItem } from "@/hooks/useWatchlist";

/* ── Floating ambient particles — cinematic bokeh effect ── */
function AmbientParticles() {
  // 3 tiers: large bokeh, medium orbs, small sparkles
  const particles = Array.from({ length: 30 }).map((_, i) => {
    const tier = i < 8 ? "large" : i < 20 ? "medium" : "small";
    const size =
      tier === "large" ? 20 + Math.random() * 30
        : tier === "medium" ? 8 + Math.random() * 12
          : 3 + Math.random() * 5;
    const blur = tier === "large" ? 12 : tier === "medium" ? 4 : 1;
    const opacity = tier === "large" ? 0.08 + Math.random() * 0.06 : tier === "medium" ? 0.15 + Math.random() * 0.15 : 0.2 + Math.random() * 0.2;
    const duration = tier === "large" ? 20 + Math.random() * 15 : tier === "medium" ? 14 + Math.random() * 10 : 10 + Math.random() * 8;
    const hue = 30 + Math.random() * 15; // warm amber-orange range
    const lightness = 50 + Math.random() * 25;

    return { size, blur, opacity, duration, hue, lightness, left: Math.random() * 100, delay: Math.random() * 20 };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: `-${p.size}px`,
            background: `radial-gradient(circle, hsl(${p.hue}, 100%, ${p.lightness}%) 0%, transparent 70%)`,
            opacity: p.opacity,
            filter: `blur(${p.blur}px)`,
            animation: `particle-float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const {
    isResearching, report, steps,
    history, error, research, clearHistory,
  } = useResearch();

  const { items: watchlistItems, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { settings: alertSettings, notifications, unreadCount, upsertSettings, markRead, markAllRead } = useAlerts();
  const isMobile = useIsMobile();

  const reportRef = useRef<HTMLDivElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const watchlistSectionRef = useRef<HTMLDivElement>(null);
  const [viewedReport, setViewedReport] = useState<ResearchReport | null>(null);

  const activeReport = viewedReport || report;
  const showReport = !!activeReport;

  const handleBack = useCallback(() => {
    if (viewedReport) {
      setViewedReport(null);
    } else {
      window.location.reload();
    }
  }, [viewedReport]);

  const handleViewFromWatchlist = useCallback((item: WatchlistItem) => {
    setViewedReport(item.report);
  }, []);

  const scrollTo = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    // If we're in report view, go back to home first
    if (viewedReport) setViewedReport(null);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [viewedReport]);

  return (
    <div className="min-h-screen bg-background relative film-grain">
      {/* Ambient background — glow orbs + bokeh particles (full page) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-30%] left-[15%] w-[800px] h-[800px] rounded-full bg-amber-500/[0.06] blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-[-20%] right-[5%] w-[700px] h-[700px] rounded-full bg-orange-500/[0.05] blur-[130px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[30%] left-[-15%] w-[600px] h-[600px] rounded-full bg-yellow-600/[0.04] blur-[100px] animate-glow-pulse" style={{ animationDelay: "4s" }} />
        <AmbientParticles />
      </div>

      {/* ── Header ── */}
      <header className="relative z-50 sticky top-0">
        <div className="glass border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              {showReport && (
                <Button variant="ghost" size="sm" onClick={handleBack} className="mr-1 text-muted-foreground hover:text-foreground hover:bg-white/[0.06]">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <img src="/src/assets/strategyroom-logo.svg" alt="StrategyRoom.ai" className="h-8 w-auto" />
              <span className="font-bold text-foreground tracking-tight text-lg">
                StrategyRoom<span className="text-gradient">.ai</span>
              </span>
            </div>

            {/* Center: Navigation pills — absolutely centered */}
            {!showReport && (
              <nav className="hidden md:flex items-center gap-1 glass-strong rounded-full px-1 py-1 absolute left-1/2 -translate-x-1/2">
                <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-4 py-1.5 text-xs font-medium text-foreground bg-white/[0.08] rounded-full flex items-center gap-1"><Home className="h-3 w-3" />Home</button>
                <button onClick={() => scrollTo(searchSectionRef)} className="px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-full flex items-center gap-1"><Search className="h-3 w-3" />Research</button>
                <button onClick={() => scrollTo(watchlistSectionRef)} className="px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-full flex items-center gap-1"><Eye className="h-3 w-3" />Watchlist</button>
                <button onClick={() => navigate("/sectors")} className="px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-full flex items-center gap-1"><BarChart3 className="h-3 w-3" />Sectors</button>
              </nav>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {showReport && activeReport && (
                <>
                  <AddToWatchlistButton
                    report={activeReport}
                    isInWatchlist={isInWatchlist(activeReport.ticker)}
                    onAdd={addToWatchlist}
                  />
                  <ExportToolbar reportRef={reportRef} report={activeReport} />
                </>
              )}

              {/* Mobile hamburger menu */}
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkRead={markRead}
                onMarkAllRead={markAllRead}
              />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex md:hidden text-muted-foreground hover:text-foreground hover:bg-white/[0.06]">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-strong border-l border-white/[0.08] w-72">
                  <SheetHeader>
                    <SheetTitle className="text-foreground flex items-center gap-2">
                      <img src="/src/assets/strategyroom-logo.svg" alt="" className="h-6 w-auto" />
                      StrategyRoom<span className="text-gradient">.ai</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-6">
                    <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground bg-white/[0.06] hover:bg-white/[0.1] transition-colors text-left">
                      <Home className="h-4 w-4 text-amber-400" /> Home
                    </button>
                    <button onClick={() => scrollTo(searchSectionRef)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors text-left">
                      <Search className="h-4 w-4" /> Research
                    </button>
                    <button onClick={() => scrollTo(watchlistSectionRef)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors text-left">
                      <Eye className="h-4 w-4" /> Watchlist
                    </button>
                    <button onClick={() => navigate("/sectors")} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors text-left">
                      <BarChart3 className="h-4 w-4" /> Sectors
                    </button>
                  </nav>
                  <div className="mt-auto pt-6 border-t border-white/[0.08]">
                    <UserMenu />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden md:block">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!showReport ? (
          /* ═══════════════  DASHBOARD HOME  ═══════════════ */
          <motion.main
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            {/* ── Hero / Research Section ── */}
            <section ref={searchSectionRef} className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 pt-10">

              {/* Hero content */}
              <motion.div
                className="relative z-10 text-center max-w-4xl mx-auto space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Pill badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-xs font-medium text-amber-400/90"
                >
                  <Sparkles className="h-3 w-3" />
                  AI-Powered Investment Intelligence
                </motion.div>

                {/* Main heading — bold, cinematic */}
                <h1
                  className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <span className="text-gradient-white">Research</span>
                  <br />
                  <span className="text-gradient">Smarter</span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Two AI agents collaborate in real-time to deliver deep investment research,
                  structured analysis, and actionable verdicts.
                </p>

                {/* Search */}
                <div className="max-w-2xl mx-auto w-full">
                  <SearchBar onSearch={research} isLoading={isResearching} />
                </div>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-full border border-destructive/20"
                >
                  {error}
                </motion.p>
              )}
            </section>

            {/* ── Activity Feed ── */}
            <div className="max-w-4xl mx-auto px-6 pt-16">
              <AgentActivityFeed steps={steps} />
            </div>

            {/* ── Dashboard Grid ── */}
            {!isResearching && (
              <section className="max-w-7xl mx-auto px-6 py-12 space-y-10">
                {/* Portfolio Summary */}
                <PortfolioSummary items={watchlistItems} />

                {/* Watchlist */}
                <div ref={watchlistSectionRef} />
                <WatchlistPanel
                  items={watchlistItems}
                  onRemove={removeFromWatchlist}
                  onReResearch={research}
                  onViewReport={handleViewFromWatchlist}
                  alertSettings={alertSettings}
                  onSaveAlertSettings={upsertSettings}
                />

                {/* History */}
                <ResearchHistory items={history} onSelect={research} onClear={clearHistory} />
              </section>
            )}
          </motion.main>
        ) : (
          /* ═══════════════  REPORT VIEW  ═══════════════ */
          <motion.main
            key="report"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 max-w-7xl mx-auto h-[calc(100vh-4rem)]"
          >
            <div className={cn("overflow-y-auto h-full", isMobile ? "p-4 pb-12" : "p-6")}>
              <ReportPanel ref={reportRef} report={activeReport} />
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
