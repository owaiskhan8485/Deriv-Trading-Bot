import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AISafetyReport } from "../types/trading";

let genAI: GoogleGenerativeAI | null = null;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function analyzeMarketWithAI(candles: any[], symbol: string): Promise<AISafetyReport> {
  const ai = getAI();
  if (!ai) {
    return {
      safetyScore: 50,
      marketSentiment: 'Neutral',
      recommendation: 'WAIT',
      insight: 'AI Analysis skipped: Missing API Key.'
    };
  }

  try {
    // We only send a subset of history and key indicators for deeper intelligence
    const recentData = candles.slice(-40).map(c => ({
      c: c.close,
      t: c.epoch
    }));

    // Simple technical indicators for AI context
    const prices = candles.slice(-20).map(c => c.close);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const volatility = Math.sqrt(prices.map(p => Math.pow(p - avg, 2)).reduce((a, b) => a + b, 0) / prices.length);

    const prompt = `Act as an Expert Quant Trader. Analyze ${symbol} data:
    Current Price: ${candles[candles.length - 1].close}
    Historical Pulse (40 ticks): ${JSON.stringify(recentData)}
    20-period Volatility: ${volatility.toFixed(6)}
    
    Assess if the current micro-structure supports a high-probability scalp. 
    Look for over-extension or clear trend exhaustion.
    Return a safety score (0-100), market sentiment, and a strictly enforced recommendation (TRADE, WAIT, AVOID). 
    If Volatility is too high or price is erratic, select AVOID.`;

    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            safetyScore: { type: SchemaType.NUMBER },
            marketSentiment: { type: SchemaType.STRING },
            recommendation: { type: SchemaType.STRING },
            insight: { type: SchemaType.STRING }
          },
          required: ["safetyScore", "marketSentiment", "recommendation", "insight"]
        }
      }
    });

    const result = await model.generateContent(prompt);
    const parsedResult = JSON.parse(result.response.text());
    
    return {
      safetyScore: parsedResult.safetyScore || 50,
      marketSentiment: parsedResult.marketSentiment || 'Neutral',
      recommendation: parsedResult.recommendation || 'WAIT',
      insight: parsedResult.insight || 'No clear diagnostic from neural analysis.'
    };
  } catch (error: any) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || '');
    const errorBody = error?.response?.data || error?.error || {};

    const isQuota = 
      errorMessage.toLowerCase().includes('quota') || 
      error?.status === 429 || 
      errorBody?.code === 429 || 
      errorBody?.status === 'RESOURCE_EXHAUSTED';

    if (!isQuota) {
      console.error('AI Service Error:', error);
    }

    return {
      safetyScore: 50,
      marketSentiment: 'Neutral',
      recommendation: 'WAIT',
      isQuotaError: isQuota,
      insight: isQuota 
        ? 'Gemini API Quota Exceeded. The bot will automatically bypass this filter if Technical Signals are high logic is enabled.' 
        : 'Neural relay connectivity issue. Fallback to manual safety.'
    };
  }
}
