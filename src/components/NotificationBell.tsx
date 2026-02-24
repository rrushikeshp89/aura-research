import { Bell, CheckCheck, ArrowRightLeft, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { AlertNotification } from "@/types/alerts";

interface NotificationBellProps {
  notifications: AlertNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const alertIcons: Record<string, typeof ArrowRightLeft> = {
  verdict_change: ArrowRightLeft,
  sentiment_shift: AlertTriangle,
  confidence_drop: TrendingDown,
};

const alertColors: Record<string, string> = {
  verdict_change: "text-amber-400",
  sentiment_shift: "text-orange-400",
  confidence_drop: "text-red-400",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationBell({ notifications, unreadCount, onMarkRead, onMarkAllRead }: NotificationBellProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground hover:bg-white/[0.06]">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-strong border-white/[0.08]" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground gap-1" onClick={onMarkAllRead}>
              <CheckCheck className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <Separator className="bg-white/[0.06]" />

        <ScrollArea className="max-h-[360px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {notifications.map((notif) => {
                const Icon = alertIcons[notif.alertType] || Bell;
                const color = alertColors[notif.alertType] || "text-muted-foreground";

                return (
                  <button
                    key={notif.id}
                    className={`w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors ${
                      !notif.read ? "bg-white/[0.02]" : ""
                    }`}
                    onClick={() => !notif.read && onMarkRead(notif.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground truncate">{notif.title}</span>
                          {!notif.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-amber-400/60">{notif.ticker}</span>
                          <span className="text-[10px] text-muted-foreground/50">{timeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
