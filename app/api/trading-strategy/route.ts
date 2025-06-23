import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const TradingStrategySchema = z.object({
  legs: z.array(
    z.object({
      action: z.enum(["BUY", "SELL"]),
      type: z.enum(["CALL", "PUT"]),
      strike: z.number(),
      expiration: z.string(),
      quantity: z.number().optional(),
      price: z.number().optional(),
    }),
  ),
  maxLoss: z.string(),
  maxGain: z.string(),
  summary: z.string(),
  riskWarning: z.string().optional(),
  breakeven: z.array(z.number()).optional(),
  strategy: z.string(),
  rationale: z.string(),
  riskReward: z.object({
    ratio: z.string(),
    probability: z.string().optional(),
  }),
})

export async function POST(req: Request) {
  try {
    const { goal, optionChain } = await req.json()
    const mode = req.headers.get("x-assistant-mode") || "general"

    if (!goal || typeof goal !== "string") {
      return new Response(JSON.stringify({ error: "Trading goal is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const systemPrompt =
      mode === "scanner"
        ? `You are an options scanner assistant. Given a user goal and option chain data, filter and recommend specific strategies that fit their criteria.

Your response should include:
1. Specific trade legs with exact strikes, expirations, and current prices from the option chain
2. Breakeven points calculated precisely
3. Risk/reward analysis with ratios and probabilities
4. Clear rationale for why this strategy fits their goal
5. Practical entry and exit criteria

Focus on actionable, specific recommendations using real market data when provided.`
        : `You are an expert options trading strategist and educator. Analyze trading goals and provide comprehensive strategy recommendations.

Your response should include:
1. Detailed trade construction with specific legs
2. Complete risk analysis including max loss, max gain, and breakeven points
3. Market outlook and timing considerations
4. Risk management guidelines
5. Educational context about the strategy

Always prioritize risk management and provide clear, actionable guidance.`

    const prompt =
      mode === "scanner"
        ? `User Goal: "${goal}"
        
${optionChain ? `Available Options Data: ${JSON.stringify(optionChain, null, 2)}` : ""}

Based on the user's goal${optionChain ? " and the available option chain data" : ""}, recommend a specific options strategy. Use actual strikes and prices from the data when available.`
        : `Analyze this trading goal and provide a comprehensive options strategy: "${goal}"

Provide realistic strike prices based on current market conditions. Use expiration dates within the next 1-3 months. Include detailed risk analysis and educational context.`

    const result = await generateObject({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: prompt,
      schema: TradingStrategySchema,
    })

    return new Response(JSON.stringify(result.object), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Trading strategy analysis error:", error)

    return new Response(
      JSON.stringify({
        error: "Strategy analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
