import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import type { AlertSettings, AlertNotification } from "@/types/alerts";

export function useAlerts() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AlertSettings[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load alert settings and notifications
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        setSettings([]);
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const [settingsRes, notifRes] = await Promise.all([
        supabase
          .from("alert_settings")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("alert_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (!cancelled) {
        if (settingsRes.data) {
          setSettings(
            settingsRes.data.map((row) => ({
              id: row.id,
              ticker: row.ticker,
              company: row.company,
              alertOnVerdictChange: row.alert_on_verdict_change,
              alertOnSentimentShift: row.alert_on_sentiment_shift,
              alertOnConfidenceDrop: row.alert_on_confidence_drop,
              confidenceThreshold: row.confidence_threshold ?? 10,
              enabled: row.enabled,
              createdAt: new Date(row.created_at).getTime(),
              updatedAt: new Date(row.updated_at).getTime(),
            }))
          );
        }

        if (notifRes.data) {
          setNotifications(
            notifRes.data.map((row) => ({
              id: row.id,
              ticker: row.ticker,
              company: row.company,
              alertType: row.alert_type as AlertNotification["alertType"],
              title: row.title,
              message: row.message,
              oldValue: row.old_value,
              newValue: row.new_value,
              read: row.read,
              createdAt: new Date(row.created_at).getTime(),
            }))
          );
        }

        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  // Upsert alert settings for a ticker
  const upsertSettings = useCallback(
    async (ticker: string, company: string, updates: Partial<Omit<AlertSettings, "id" | "ticker" | "company" | "createdAt" | "updatedAt">>) => {
      if (!user) return;

      const { error } = await supabase.from("alert_settings").upsert(
        {
          user_id: user.id,
          ticker,
          company,
          alert_on_verdict_change: updates.alertOnVerdictChange ?? true,
          alert_on_sentiment_shift: updates.alertOnSentimentShift ?? true,
          alert_on_confidence_drop: updates.alertOnConfidenceDrop ?? false,
          confidence_threshold: updates.confidenceThreshold ?? 10,
          enabled: updates.enabled ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,ticker" }
      );

      if (!error) {
        // Re-fetch
        const { data } = await supabase
          .from("alert_settings")
          .select("*")
          .order("created_at", { ascending: false });

        if (data) {
          setSettings(
            data.map((row) => ({
              id: row.id,
              ticker: row.ticker,
              company: row.company,
              alertOnVerdictChange: row.alert_on_verdict_change,
              alertOnSentimentShift: row.alert_on_sentiment_shift,
              alertOnConfidenceDrop: row.alert_on_confidence_drop,
              confidenceThreshold: row.confidence_threshold ?? 10,
              enabled: row.enabled,
              createdAt: new Date(row.created_at).getTime(),
              updatedAt: new Date(row.updated_at).getTime(),
            }))
          );
        }
      }
    },
    [user]
  );

  // Delete alert settings
  const removeSettings = useCallback(
    async (ticker: string) => {
      if (!user) return;
      await supabase.from("alert_settings").delete().eq("user_id", user.id).eq("ticker", ticker);
      setSettings((prev) => prev.filter((s) => s.ticker !== ticker));
    },
    [user]
  );

  // Mark notification as read
  const markRead = useCallback(
    async (notificationId: string) => {
      if (!user) return;
      await supabase.from("alert_notifications").update({ read: true }).eq("id", notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    },
    [user]
  );

  // Mark all as read
  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("alert_notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user]);

  // Get settings for a specific ticker
  const getSettings = useCallback(
    (ticker: string) => settings.find((s) => s.ticker === ticker) || null,
    [settings]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    settings,
    notifications,
    unreadCount,
    loading,
    upsertSettings,
    removeSettings,
    markRead,
    markAllRead,
    getSettings,
  };
}
