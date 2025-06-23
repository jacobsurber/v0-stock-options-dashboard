import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // Mock options data for now
    const mockOptionsData = {
      symbol,
      expirationDates: ["2024-01-19", "2024-02-16", "2024-03-15"],
      chains: {
        "2024-01-19": {
          calls: [
            { strike: 150, bid: 5.2, ask: 5.4, volume: 1250, openInterest: 3400, impliedVolatility: 0.28 },
            { strike: 155, bid: 2.8, ask: 3.0, volume: 890, openInterest: 2100, impliedVolatility: 0.31 },
            { strike: 160, bid: 1.2, ask: 1.4, volume: 450, openInterest: 1800, impliedVolatility: 0.35 },
          ],
          puts: [
            { strike: 150, bid: 2.1, ask: 2.3, volume: 780, openInterest: 2200, impliedVolatility: 0.29 },
            { strike: 155, bid: 4.5, ask: 4.7, volume: 1100, openInterest: 2800, impliedVolatility: 0.32 },
            { strike: 160, bid: 7.8, ask: 8.0, volume: 650, openInterest: 1900, impliedVolatility: 0.36 },
          ],
        },
      },
    }

    return NextResponse.json(mockOptionsData)
  } catch (error) {
    console.error("Options API error:", error)
    return NextResponse.json({ error: "Failed to fetch options data" }, { status: 500 })
  }
}
