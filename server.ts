import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to format currency and percentages for prompts
function formatDollar(val: number): string {
  return (val < 0 ? '-' : '') + '$' + Math.abs(Math.round(val)).toLocaleString();
}

function formatPct(val: number): string {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

// Gemini Client initialization with required headers
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10;

if (isRealApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// POST /api/generate-summary
app.post('/api/generate-summary', async (req: Request, res: Response) => {
  try {
    const { metrics } = req.body;

    if (!metrics || !metrics.topRegion) {
      return res.status(400).json({ error: 'Missing calculated sales metrics.' });
    }

    const {
      topRegion,
      topRegionMetrics,
      allRegionsComparison,
    } = metrics;

    // Grounded data prompt representation
    const dataContext = `
Calculated Metrics from Sales Orders CSV:
- Region with largest Q2 to Q3 change: "${topRegion}"
- Q2 Revenue: ${formatDollar(topRegionMetrics.q2Revenue)} ($${topRegionMetrics.q2Revenue.toFixed(2)})
- Q3 Revenue: ${formatDollar(topRegionMetrics.q3Revenue)} ($${topRegionMetrics.q3Revenue.toFixed(2)})
- Net Dollar Change: ${formatDollar(topRegionMetrics.dollarDelta)} ($${topRegionMetrics.dollarDelta.toFixed(2)})
- Percentage Change: ${formatPct(topRegionMetrics.pctDelta)} (${topRegionMetrics.pctDelta.toFixed(1)}%)
- Absolute Dollar Shift: ${formatDollar(topRegionMetrics.absDollarDelta)}
- Q2 Units Sold: ${topRegionMetrics.q2Units.toLocaleString()} units
- Q3 Units Sold: ${topRegionMetrics.q3Units.toLocaleString()} units
- Units Delta: ${topRegionMetrics.unitsDelta >= 0 ? '+' : ''}${topRegionMetrics.unitsDelta.toLocaleString()} units (${formatPct(topRegionMetrics.unitsPctDelta)})
- Q2 Average Discount Rate: ${topRegionMetrics.q2AvgDiscountPct.toFixed(1)}%
- Q3 Average Discount Rate: ${topRegionMetrics.q3AvgDiscountPct.toFixed(1)}%
- Discount Delta: ${(topRegionMetrics.q3AvgDiscountPct - topRegionMetrics.q2AvgDiscountPct).toFixed(1)} percentage points
- Top Contributing Channel: "${topRegionMetrics.topChannel?.name || 'N/A'}" (Q2: ${formatDollar(topRegionMetrics.topChannel?.q2Revenue || 0)}, Q3: ${formatDollar(topRegionMetrics.topChannel?.q3Revenue || 0)}, change: ${formatDollar(topRegionMetrics.topChannel?.delta || 0)})
- Top Contributing Product: "${topRegionMetrics.topProduct?.name || 'N/A'}" (Q2: ${formatDollar(topRegionMetrics.topProduct?.q2Revenue || 0)}, Q3: ${formatDollar(topRegionMetrics.topProduct?.q3Revenue || 0)}, change: ${formatDollar(topRegionMetrics.topProduct?.delta || 0)})
- Other Regions Q2->Q3 Comparison:
${allRegionsComparison.map((r: any) => `  * ${r.region}: Q2 ${formatDollar(r.q2Revenue)} -> Q3 ${formatDollar(r.q3Revenue)} (Change: ${formatDollar(r.dollarDelta)}, ${formatPct(r.pctDelta)})`).join('\n')}
`.trim();

    if (!ai && isRealApiKey) {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    // Helper to generate grounded 3-sentence summary using calculated figures
    const generateCalculatedSummary = () => {
      const sentence1 = `${topRegion} experienced the largest revenue shift from Q2 to Q3, moving from ${formatDollar(topRegionMetrics.q2Revenue)} to ${formatDollar(topRegionMetrics.q3Revenue)}, a net change of ${formatDollar(topRegionMetrics.dollarDelta)} (${formatPct(topRegionMetrics.pctDelta)}).`;
      const sentence2 = `This shift was driven primarily by unit sales which moved from ${topMetricsVolume(topRegionMetrics.q2Units)} to ${topMetricsVolume(topRegionMetrics.q3Units)} units (${formatPct(topRegionMetrics.unitsPctDelta)}), with the ${topRegionMetrics.topChannel?.name || 'primary'} channel leading quarterly variance at ${formatDollar(topRegionMetrics.topChannel?.delta || 0)}.`;
      const sentence3 = `Furthermore, ${topRegionMetrics.topProduct?.name || 'top products'} contributed a ${formatDollar(topRegionMetrics.topProduct?.delta || 0)} difference, while average discount rates adjusted from ${topRegionMetrics.q2AvgDiscountPct.toFixed(1)}% in Q2 to ${topRegionMetrics.q3AvgDiscountPct.toFixed(1)}% in Q3.`;
      return `${sentence1} ${sentence2} ${sentence3}`;
    };

    function topMetricsVolume(n: number): string {
      return n.toLocaleString();
    }

    if (!ai) {
      return res.json({
        summary: generateCalculatedSummary(),
        source: 'calculated_grounded_engine',
        isAi: false,
      });
    }

    const prompt = `You are a financial analyst summarizing quarterly sales order performance.

${dataContext}

Task: Write a THREE-SENTENCE summary of which region changed most from Q2 to Q3, and why, using ONLY numbers the app calculated above.

Strict Requirements:
1. Length: Exactly 3 sentences. No more, no less.
2. Content:
   - Sentence 1: Identify "${topRegion}" as the region with the largest change from Q2 to Q3, citing its Q2 revenue, Q3 revenue, and the exact dollar change and percentage change.
   - Sentence 2: Explain why this happened using the calculated volume (units sold) and top channel or product driver numbers.
   - Sentence 3: Complete the explanation citing the calculated discount rate changes and product/channel contributions.
3. Grounding: You must use ONLY numbers provided in the calculated data above. Do NOT invent, assume, or calculate outside numbers. Round dollar numbers cleanly as formatted in the context (e.g. $XX,XXX).
4. Tone: Analytical, clear, factual, and direct.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
        },
      });

      const summaryText = response.text?.trim() || '';

      return res.json({
        summary: summaryText,
        source: 'gemini-3.8-flash',
        isAi: true,
      });
    } catch (genAiError: any) {
      console.warn('Gemini generateContent error, using grounded calculation summary:', genAiError?.message);
      return res.json({
        summary: generateCalculatedSummary(),
        source: 'grounded_calculation_engine',
        isAi: false,
        error: genAiError?.message,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/generate-summary:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate summary.',
    });
  }
});

// Setup Vite middleware in dev or static server in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
