import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    console.log("Chat API called with messages:", messages?.length || 0)

    const result = await streamText({
      model: openai("gpt-4o", {
        apiKey:
          "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",
      }),
      system: `You are an expert AI trading assistant specializing in options trading and financial markets. You have deep knowledge of:

- Options strategies (calls, puts, spreads, straddles, strangles, etc.)
- Technical analysis and chart patterns
- Risk management and portfolio optimization
- Market analysis and economic indicators
- Options Greeks (delta, gamma, theta, vega, rho)
- Earnings plays and volatility trading
- Paper trading and backtesting strategies

Provide clear, actionable advice while always emphasizing risk management. Use professional trading terminology but explain complex concepts clearly. Always remind users that trading involves risk and past performance doesn't guarantee future results.

Keep responses concise but informative, focusing on practical trading insights.`,
      messages,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)

    // Return a more detailed error response
    return new Response(
      JSON.stringify({
        error: "Chat API failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
