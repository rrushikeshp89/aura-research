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

    if (response.status !== 429 && response.status !== 503) {
      throw new Error(`Gemini API error: ${lastError}`);
    }

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
    const { sector } = await req.json();
    if (!sector) {
      return new Response(
        JSON.stringify({ error: 'sector is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'GOOGLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sector analysis for:', sector);

    const systemPrompt = `You are a senior financial sector analyst. Analyze the given sector and produce a structured report covering the top 6-10 companies in that sector.

IMPORTANT: Return ONLY valid JSON — no markdown fences, no extra text.

JSON Schema:
{
  "sector": "Sector name",
  "companies": [
    {
      "ticker": "TICKER",
      "company": "Full company name",
      "verdict": "Buy" | "Hold" | "Sell",
      "confidenceScore": 0-100,
      "sentiment": "Bullish" | "Neutral" | "Bearish",
      "executiveSummary": "1-2 sentence thesis on this company"
    }
  ],
  "averageConfidence": 0-100,
  "sentimentDistribution": {
    "bullish": <count>,
    "neutral": <count>,
    "bearish": <count>
  },
  "verdictDistribution": {
    "buy": <count>,
    "hold": <count>,
    "sell": <count>
  }
}

INSTRUCTIONS:
- Include the 6-10 most prominent/investable companies in this sector.
- Provide realistic verdicts and confidence scores based on your most recent knowledge.
- The sentimentDistribution and verdictDistribution counts must match the actual company entries.
- averageConfidence should be the arithmetic mean of all company confidenceScores.
- Each company's executiveSummary should concisely convey the investment thesis.
- Order companies by confidenceScore descending (most confident first).`;

    const aiResponse = await callGeminiWithRetry(apiKey, {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nAnalyze this sector: ${sector}` }],
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
    const analysis = JSON.parse(jsonStr);

    console.log('Sector analysis complete for', sector, '| Companies:', analysis.companies?.length);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sector analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Sector analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
