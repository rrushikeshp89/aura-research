import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_RETRIES = 3;

async function callGeminiWithRetry(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let lastError = '';

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return await response.json();
    }

    const errText = await response.text();
    lastError = `${response.status}: ${errText}`;
    console.error(`Gemini attempt ${attempt + 1}/${MAX_RETRIES} failed:`, response.status);

    // Only retry on 429 (rate limit) or 503 (service unavailable)
    if (response.status !== 429 && response.status !== 503) {
      throw new Error(`Gemini API error: ${lastError}`);
    }

    // Exponential backoff: 2s, 4s, 8s
    const delay = Math.pow(2, attempt + 1) * 1000;
    console.log(`Retrying in ${delay}ms...`);
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error(`Gemini API failed after ${MAX_RETRIES} retries: ${lastError}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company, researchData } = await req.json();
    if (!company) {
      return new Response(JSON.stringify({ error: 'company is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Analyzing:', company, '| Sources:', Array.isArray(researchData) ? researchData.length : 0);

    interface ResearchSource { title: string; url: string; content: string; }

    const sources = Array.isArray(researchData) ? researchData : [];
    const sourceSummary = sources.length > 0
      ? sources.map((s: ResearchSource, i: number) => `Source ${i + 1}: ${s.title}\nURL: ${s.url}\n${s.content}`).join('\n\n---\n\n')
      : 'No external research data available. Use your most recent knowledge about this company to produce the analysis.';

    const systemPrompt = `You are a senior financial analyst. Analyze the provided research data and produce a structured investment report in valid JSON format.

IMPORTANT: Return ONLY valid JSON — no markdown fences, no extra text.

JSON Schema:
{
  "company": "Full company name",
  "ticker": "TICKER",
  "verdict": "Buy" | "Hold" | "Sell",
  "confidenceScore": 0-100,
  "executiveSummary": "2-3 sentence summary of your thesis",
  "fundamentals": {
    "revenue": "Latest annual/quarterly revenue",
    "earnings": "Latest EPS or net income",
    "peRatio": "Current P/E ratio",
    "marketCap": "Current market cap",
    "balanceSheetHighlights": ["highlight 1", "highlight 2"]
  },
  "sentimentAnalysis": {
    "overallSentiment": "Bullish" | "Neutral" | "Bearish",
    "newsSummary": "Summary of recent news and catalysts",
    "analystConsensus": "Summary of analyst ratings"
  },
  "riskFactors": ["risk 1", "risk 2", "risk 3"],
  "sources": [{"title": "Source title", "url": "https://..."}],
  "reasoningChain": [
    {
      "step": 1,
      "title": "Short title for this reasoning step",
      "analysis": "Detailed analysis for this step",
      "evidence": "Specific data points or quotes supporting this step",
      "impact": "Bullish" | "Bearish" | "Neutral"
    }
  ],
  "confidenceBreakdown": {
    "fundamentalStrength": 0-100,
    "sentimentSignal": 0-100,
    "dataQuality": 0-100,
    "riskAdjustment": 0-100,
    "explanation": "Brief explanation of how these factors combine into the final confidence score"
  }
}

REASONING CHAIN INSTRUCTIONS:
- Provide 4-6 reasoning steps showing analytical progression from data review to final verdict.
- Each step should build upon the previous one logically.
- Mark each step's impact as "Bullish", "Bearish", or "Neutral".
- Include specific numbers and data points in the evidence field.

CONFIDENCE BREAKDOWN INSTRUCTIONS:
- The four sub-scores should approximately average to the overall confidenceScore.
- fundamentalStrength: How strong are the company's financial fundamentals?
- sentimentSignal: How positive is market sentiment, news flow, and analyst consensus?
- dataQuality: How reliable, recent, and comprehensive is the available data?
- riskAdjustment: Inverse of risk — higher = fewer/lower risks (100 = minimal, 0 = extreme).

Cross-reference data points from multiple sources. If data conflicts, note it. Be specific with numbers. Sources array should include the actual URLs from the research data.`;

    const aiResponse = await callGeminiWithRetry(apiKey, {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nAnalyze this company: ${company}\n\nResearch Data:\n${sourceSummary}` }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const content = (aiResponse as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      .candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!content) {
      console.error('Empty Gemini response:', JSON.stringify(aiResponse));
      return new Response(
        JSON.stringify({ error: 'Empty response from AI' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const report = JSON.parse(jsonStr);

    console.log('Analysis complete for', company, '| Verdict:', report.verdict);

    return new Response(
      JSON.stringify({ success: true, report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Analyst error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
