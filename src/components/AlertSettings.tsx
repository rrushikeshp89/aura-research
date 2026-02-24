import { useState, useEffect } from "react";
import { Bell, BellOff, TrendingDown, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { AlertSettings as AlertSettingsType } from "@/types/alerts";

interface AlertSettingsProps {
  ticker: string;
  company: string;
  currentSettings: AlertSettingsType | null;
  onSave: (ticker: string, company: string, updates: Partial<Omit<AlertSettingsType, "id" | "ticker" | "company" | "createdAt" | "updatedAt">>) => void;
}

export function AlertSettingsButton({ ticker, company, currentSettings, onSave }: AlertSettingsProps) {
  const [verdictChange, setVerdictChange] = useState(currentSettings?.alertOnVerdictChange ?? true);
  const [sentimentShift, setSentimentShift] = useState(currentSettings?.alertOnSentimentShift ?? true);
  const [confidenceDrop, setConfidenceDrop] = useState(currentSettings?.alertOnConfidenceDrop ?? false);
  const [threshold, setThreshold] = useState(currentSettings?.confidenceThreshold ?? 10);
  const [enabled, setEnabled] = useState(currentSettings?.enabled ?? true);
  const [open, setOpen] = useState(false);

  // Sync with external settings changes
  useEffect(() => {
    if (currentSettings) {
      setVerdictChange(currentSettings.alertOnVerdictChange);
      setSentimentShift(currentSettings.alertOnSentimentShift);
      setConfidenceDrop(currentSettings.alertOnConfidenceDrop);
      setThreshold(currentSettings.confidenceThreshold);
      setEnabled(currentSettings.enabled);
    }
  }, [currentSettings]);

  function handleSave() {
    onSave(ticker, company, {
      alertOnVerdictChange: verdictChange,
      alertOnSentimentShift: sentimentShift,
      alertOnConfidenceDrop: confidenceDrop,
      confidenceThreshold: threshold,
      enabled,
    });
    setOpen(false);
  }

  const hasAlerts = currentSettings !== null;
  const isActive = hasAlerts && enabled;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${isActive ? "text-amber-400 hover:text-amber-300" : "text-muted-foreground hover:text-foreground"}`}
          title="Alert settings"
        >
          {isActive ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-strong border-white/[0.08]" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Alert Settings</h4>
              <p className="text-xs text-muted-foreground">{ticker} · {company}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="alerts-enabled" className="text-xs text-muted-foreground">Enabled</Label>
              <Switch id="alerts-enabled" checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </div>

          <Separator className="bg-white/[0.06]" />

          <div className="space-y-3">
            {/* Verdict Change */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                <Label htmlFor="verdict-change" className="text-xs font-medium">Verdict Change</Label>
              </div>
              <Switch
                id="verdict-change"
                checked={verdictChange}
                onCheckedChange={setVerdictChange}
                disabled={!enabled}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/70 ml-5">Alert when verdict changes (e.g., Buy → Hold)</p>

            {/* Sentiment Shift */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <Label htmlFor="sentiment-shift" className="text-xs font-medium">Sentiment Shift</Label>
              </div>
              <Switch
                id="sentiment-shift"
                checked={sentimentShift}
                onCheckedChange={setSentimentShift}
                disabled={!enabled}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/70 ml-5">Alert when sentiment changes direction</p>

            {/* Confidence Drop */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
                <Label htmlFor="confidence-drop" className="text-xs font-medium">Confidence Drop</Label>
              </div>
              <Switch
                id="confidence-drop"
                checked={confidenceDrop}
                onCheckedChange={setConfidenceDrop}
                disabled={!enabled}
              />
            </div>

            {confidenceDrop && (
              <div className="ml-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Threshold</span>
                  <span className="text-[10px] font-mono text-amber-400">≥ {threshold}pts</span>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={([v]) => setThreshold(v)}
                  min={5}
                  max={30}
                  step={5}
                  disabled={!enabled}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <Separator className="bg-white/[0.06]" />

          <Button size="sm" className="w-full h-8 text-xs" onClick={handleSave}>
            Save Alert Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
