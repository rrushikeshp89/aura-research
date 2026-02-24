import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Re-Research Function
 * 
 * This function is designed to be invoked periodically (e.g., daily via Supabase cron
 * or an external scheduler). It:
 * 
 * 1. Fetches all watchlist entries with active alert_settings
 * 2. Re-runs research + analysis for each ticker
 * 3. Compares old vs new results
 * 4. Creates alert_notifications for detected changes
 * 5. Updates the watchlist with fresh report data
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface WatchlistRow {
  id: string;
  user_id: string;
  company: string;
  ticker: string;
  verdict: string;
  confidence_score: number;
  report_json: Record<string, unknown>;
}

interface AlertSettingsRow {
  user_id: string;
  ticker: string;
  company: string;
  alert_on_verdict_change: boolean;
  alert_on_sentiment_shift: boolean;
  alert_on_confidence_drop: boolean;
  confidence_threshold: number | null;
  enabled: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Optional: verify a secret to prevent unauthorized invocations
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also allow Supabase service-role calls
    if (!authHeader?.includes(SUPABASE_SERVICE_ROLE_KEY)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Get all alert settings that are enabled
    const { data: alertRows, error: alertErr } = await supabaseAdmin
      .from('alert_settings')
      .select('*')
      .eq('enabled', true);

    if (alertErr || !alertRows || alertRows.length === 0) {
      console.log('No active alerts found, skipping.');
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No active alerts' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${alertRows.length} active alert configurations`);

    // Group by user_id + ticker to avoid duplicate processing
    const uniqueTickers = new Map<string, { watchlistRow: WatchlistRow | null; alerts: AlertSettingsRow[] }>();

    for (const alert of alertRows as AlertSettingsRow[]) {
      const key = `${alert.user_id}:${alert.ticker}`;
      if (!uniqueTickers.has(key)) {
        // Fetch the watchlist entry for this user+ticker
        const { data: wlData } = await supabaseAdmin
          .from('watchlist')
          .select('*')
          .eq('user_id', alert.user_id)
          .eq('ticker', alert.ticker)
          .single();

        uniqueTickers.set(key, {
          watchlistRow: (wlData as WatchlistRow) || null,
          alerts: [alert],
        });
      } else {
        uniqueTickers.get(key)!.alerts.push(alert);
      }
    }

    let processed = 0;
    let notificationsCreated = 0;

    for (const [key, { watchlistRow, alerts }] of uniqueTickers) {
      if (!watchlistRow) {
        console.log(`Skipping ${key}: no watchlist entry found`);
        continue;
      }

      const oldReport = watchlistRow.report_json as Record<string, unknown>;
      const oldVerdict = watchlistRow.verdict;
      const oldConfidence = watchlistRow.confidence_score;
      const oldSentiment = (oldReport?.sentimentAnalysis as Record<string, unknown>)?.overallSentiment as string || 'Neutral';

      console.log(`Re-researching ${watchlistRow.company} (${watchlistRow.ticker})...`);

      try {
        // Call researcher
        const researchRes = await fetch(`${SUPABASE_URL}/functions/v1/researcher`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ company: watchlistRow.company }),
        });

        if (!researchRes.ok) {
          console.error(`Researcher failed for ${watchlistRow.ticker}: ${researchRes.status}`);
          continue;
        }

        const researchData = await researchRes.json();
        const sources = researchData?.research || [];

        // Call analyst
        const analystRes = await fetch(`${SUPABASE_URL}/functions/v1/analyst`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ company: watchlistRow.company, researchData: sources }),
        });

        if (!analystRes.ok) {
          console.error(`Analyst failed for ${watchlistRow.ticker}: ${analystRes.status}`);
          continue;
        }

        const analysisData = await analystRes.json();
        const newReport = analysisData?.report;

        if (!newReport) {
          console.error(`No report returned for ${watchlistRow.ticker}`);
          continue;
        }

        const newVerdict = newReport.verdict as string;
        const newConfidence = newReport.confidenceScore as number;
        const newSentiment = newReport.sentimentAnalysis?.overallSentiment as string || 'Neutral';

        // 3. Compare and generate notifications
        for (const alert of alerts) {
          // Verdict change
          if (alert.alert_on_verdict_change && oldVerdict !== newVerdict) {
            await supabaseAdmin.from('alert_notifications').insert({
              user_id: alert.user_id,
              ticker: watchlistRow.ticker,
              company: watchlistRow.company,
              alert_type: 'verdict_change',
              title: `${watchlistRow.ticker}: Verdict changed`,
              message: `${watchlistRow.company} verdict changed from ${oldVerdict} to ${newVerdict} (confidence: ${newConfidence}%).`,
              old_value: oldVerdict,
              new_value: newVerdict,
            });
            notificationsCreated++;
          }

          // Sentiment shift
          if (alert.alert_on_sentiment_shift && oldSentiment !== newSentiment) {
            await supabaseAdmin.from('alert_notifications').insert({
              user_id: alert.user_id,
              ticker: watchlistRow.ticker,
              company: watchlistRow.company,
              alert_type: 'sentiment_shift',
              title: `${watchlistRow.ticker}: Sentiment shifted`,
              message: `${watchlistRow.company} sentiment shifted from ${oldSentiment} to ${newSentiment}.`,
              old_value: oldSentiment,
              new_value: newSentiment,
            });
            notificationsCreated++;
          }

          // Confidence drop
          if (alert.alert_on_confidence_drop) {
            const threshold = alert.confidence_threshold || 10;
            const drop = oldConfidence - newConfidence;
            if (drop >= threshold) {
              await supabaseAdmin.from('alert_notifications').insert({
                user_id: alert.user_id,
                ticker: watchlistRow.ticker,
                company: watchlistRow.company,
                alert_type: 'confidence_drop',
                title: `${watchlistRow.ticker}: Confidence dropped`,
                message: `${watchlistRow.company} confidence dropped by ${drop} points (${oldConfidence}% → ${newConfidence}%).`,
                old_value: String(oldConfidence),
                new_value: String(newConfidence),
              });
              notificationsCreated++;
            }
          }
        }

        // 4. Update watchlist with fresh report
        await supabaseAdmin
          .from('watchlist')
          .update({
            verdict: newVerdict,
            confidence_score: newConfidence,
            report_json: newReport,
            updated_at: new Date().toISOString(),
          })
          .eq('id', watchlistRow.id);

        processed++;
        console.log(`✓ ${watchlistRow.ticker}: ${oldVerdict}→${newVerdict}, ${oldConfidence}→${newConfidence}`);
      } catch (err) {
        console.error(`Error processing ${watchlistRow.ticker}:`, err);
      }
    }

    console.log(`Cron complete: ${processed} tickers processed, ${notificationsCreated} notifications created`);

    return new Response(
      JSON.stringify({ success: true, processed, notificationsCreated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cron re-research error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Cron failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
