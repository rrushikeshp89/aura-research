-- Alert preferences per watchlist ticker
CREATE TABLE IF NOT EXISTS public.alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company TEXT NOT NULL,
  alert_on_verdict_change BOOLEAN NOT NULL DEFAULT true,
  alert_on_sentiment_shift BOOLEAN NOT NULL DEFAULT true,
  alert_on_confidence_drop BOOLEAN NOT NULL DEFAULT false,
  confidence_threshold INTEGER DEFAULT 10, -- trigger if confidence drops by >= N points
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, ticker)
);

-- Alert notifications / history
CREATE TABLE IF NOT EXISTS public.alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('verdict_change', 'sentiment_shift', 'confidence_drop')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_alert_settings_user ON public.alert_settings(user_id);
CREATE INDEX idx_alert_settings_ticker ON public.alert_settings(user_id, ticker);
CREATE INDEX idx_alert_notifications_user ON public.alert_notifications(user_id);
CREATE INDEX idx_alert_notifications_unread ON public.alert_notifications(user_id, read) WHERE read = false;

-- Enable RLS
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- Alert settings policies
CREATE POLICY "Users can view own alert settings"
  ON public.alert_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert settings"
  ON public.alert_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert settings"
  ON public.alert_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert settings"
  ON public.alert_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Alert notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.alert_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.alert_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.alert_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.alert_notifications FOR DELETE
  USING (auth.uid() = user_id);
