import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google Gen AI SDK
// The API key is securely injected into process.env by the AI Studio platform
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
AMAZON AI SAAS — ENTERPRISE SYSTEM PROMPT (PROFESSIONAL)

You are Amazon Product Intelligence AI, an enterprise-level multi-agent SaaS system designed to analyze Amazon products using real data, pricing intelligence, and conversion optimization.

You are not a single assistant — you simulate a team of specialized AI agents working together.

👥 MULTI-AGENT ARCHITECTURE

Internally you consist of:

Market Research Agent: Identifies demand, trends, and competition. Evaluates product niche strength.
Pricing Intelligence Agent: Analyzes live pricing and discounts. Uses Keepa-style historical price behavior.
Quality & Review Agent: Evaluates customer reviews sentiment. Detects product issues, quality signals.
Conversion Optimization Agent: Predicts purchase likelihood. Optimizes product positioning for sales.
Affiliate Strategy Agent: Generates Amazon affiliate links. Maximizes revenue opportunities.
Scoring Engine: Produces final product score (0–100). Combines all agent outputs.

📦 DATA SOURCES (TRUTH LAYER)
Use the googleSearch tool to locate real product data, pricing, and reviews. If data is missing or you cannot find it via search, clearly state: "Insufficient marketplace data available."

🧠 CORE BEHAVIOR RULES
You must be data-driven, not opinion-based.
You must prioritize profitability + conversion + demand.
You must avoid hallucinating product details. Use the supplied tools to find real data.
You must simulate enterprise-level SaaS intelligence.

📈 SCORING LOGIC
Market Demand -> 25%
Price Advantage -> 20%
Review Quality -> 20%
Conversion Probability -> 20%
Trend Momentum -> 15%
Final Score = 0–100

🔗 AFFILIATE RULE
Always generate affiliate link using: https://www.amazon.com/dp/{ASIN}?tag=amz-product-intelligence-20

🚨 IMPORTANT RULES
Never output raw reasoning.
Never break JSON format.
Never guess missing Amazon data.
Never behave like a chatbot — behave like SaaS engine.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    product_name: { type: Type.STRING, description: "Name of the product" },
    asin: { type: Type.STRING, description: "Amazon Standard Identification Number" },
    market_analysis: {
      type: Type.OBJECT,
      properties: {
        demand_level: { type: Type.STRING, description: "High, Medium, or Low with brief explanation" },
        competition_level: { type: Type.STRING, description: "High, Medium, or Low with brief explanation" },
        trend_status: { type: Type.STRING, description: "Rising, Stable, or Declining" },
      },
    },
    pricing_analysis: {
      type: Type.OBJECT,
      properties: {
        current_price: { type: Type.STRING, description: "Current price formatted as currency" },
        avg_price: { type: Type.STRING, description: "Historical average price estimate" },
        price_drop_signal: { type: Type.STRING, description: "Current price versus average description" },
      },
    },
    quality_analysis: {
      type: Type.OBJECT,
      properties: {
        rating_summary: { type: Type.STRING, description: "Average star rating and number of reviews" },
        review_sentiment: { type: Type.STRING, description: "Summary of customer sentiment" },
        common_issues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of frequent complaints" },
      },
    },
    conversion_analysis: {
      type: Type.OBJECT,
      properties: {
        buy_probability: { type: Type.STRING, description: "High, Medium, or Low conversion likelihood" },
        target_audience: { type: Type.STRING, description: "Primary demographic for the product" },
        selling_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key features driving sales" },
      },
    },
    affiliate_link: { type: Type.STRING, description: "The Amazon affiliate URL" },
    final_score: { type: Type.NUMBER, description: "Score from 0-100 based on the scoring logic" },
    recommendation: { type: Type.STRING, description: "Final actionable recommendation" },
  },
};

export interface ProductAnalysis {
  product_name: string;
  asin: string;
  market_analysis: {
    demand_level: string;
    competition_level: string;
    trend_status: string;
  };
  pricing_analysis: {
    current_price: string;
    avg_price: string;
    price_drop_signal: string;
  };
  quality_analysis: {
    rating_summary: string;
    review_sentiment: string;
    common_issues: string[];
  };
  conversion_analysis: {
    buy_probability: string;
    target_audience: string;
    selling_points: string[];
  };
  affiliate_link: string;
  final_score: number;
  recommendation: string;
}

export async function analyzeProduct(queryOrAsin: string): Promise<ProductAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze the following Amazon product or ASIN: "${queryOrAsin}"`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Low temperature for more analytical/data-driven result
      },
    });

    if (!response.text) {
      throw new Error("No response received from GenAI.");
    }
    
    return JSON.parse(response.text.trim()) as ProductAnalysis;
  } catch (err) {
    console.error("Error analyzing product with Gemini:", err);
    throw err;
  }
}
