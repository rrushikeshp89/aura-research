import { corsHeaders } from '../_shared/cors.ts';

interface ResearchResultItem {
  title?: string;
  url?: string;
  markdown?: string;
  description?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company } = await req.json();
    if (!company) {
      return new Response(JSON.stringify({ error: 'Company is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Researching:', company);

    // Run multiple searches in parallel for comprehensive data
    const searches = [
      `${company} stock financial data revenue earnings P/E ratio 2025`,
      `${company} latest news analyst rating buy sell hold`,
      `${company} risk factors SEC filing balance sheet`,
    ];

    const results = await Promise.all(
      searches.map(async (query) => {
        try {
          const res = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query,
              limit: 5,
              scrapeOptions: { formats: ['markdown'] },
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error(`Firecrawl search failed for "${query}": ${res.status}`, errText);
            return { data: [], success: false };
          }

          const data = await res.json();
          console.log(`Firecrawl search "${query.slice(0, 40)}..." returned ${data.data?.length || 0} results`);
          return data;
        } catch (err) {
          console.error(`Firecrawl fetch error for "${query}":`, err);
          return { data: [], success: false };
        }
      })
    );

    // Combine all search results into a single research payload
    const allResults = results.flatMap((r) => r.data || []);

    const research = allResults.map((item: ResearchResultItem) => ({
      title: item.title || '',
      url: item.url || '',
      content: (item.markdown || item.description || '').slice(0, 2000),
    }));

    console.log(`Collected ${research.length} total sources for ${company}`);

    return new Response(
      JSON.stringify({ success: true, research }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Researcher error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Research failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
