-- Create research_history table for cloud-synced research history
CREATE TABLE IF NOT EXISTS public.research_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  ticker TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('Buy', 'Hold', 'Sell')),
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_research_history_user_id ON public.research_history(user_id);
CREATE INDEX IF NOT EXISTS idx_research_history_created_at ON public.research_history(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.research_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own history
CREATE POLICY "Users can view own history"
  ON public.research_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "Users can insert own history"
  ON public.research_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own history
CREATE POLICY "Users can delete own history"
  ON public.research_history FOR DELETE
  USING (auth.uid() = user_id);
