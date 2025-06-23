import { type NextRequest, NextResponse } from "next/server"

// Generate deterministic historical data
function generateHistoricalData(symbol: string, timeframe: string, days = 30) {
  const data = []
  const now = new Date()

  // Use symbol as seed for consistent data
  const seed = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

  // Base price varies by symbol
  const basePrice = 100 + (seed % 500)

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Create deterministic but realistic price movement
    const dayOffset = (seed + i) * 0.1
    const trend = Math.sin(dayOffset) * 10
    const noise = Math.sin(dayOffset * 3) * 5

    const open = basePrice + trend + noise
    const close = open + Math.sin(dayOffset * 2) * 3
    const high = Math.max(open, close) + Math.abs(Math.sin(dayOffset * 4)) * 2
    const low = Math.min(open, close) - Math.abs(Math.sin(dayOffset * 5)) * 2
    const volume = Math.floor(1000000 + Math.sin(dayOffset * 1.5) * 500000)

    data.push({
      timestamp: date.getTime(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: volume,
    })
  }

  return data
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol") || "AAPL"
    const timeframe = searchParams.get("timeframe") || "1D"

    console.log(`Generating historical data for ${symbol} with timeframe ${timeframe}`)

    // Determine how many data points to generate based on timeframe
    let days = 30
    switch (timeframe) {
      case "1m":
      case "5m":
      case "15m":
      case "1H":
      case "4H":
        days = 1
        break
      case "1D":
        days = 30
        break
      case "5D":
        days = 5
        break
      case "1M":
        days = 30
        break
      case "3M":
        days = 90
        break
      case "6M":
        days = 180
        break
      case "1Y":
        days = 365
        break
    }

    const historicalData = generateHistoricalData(symbol, timeframe, days)

    const response = {
      symbol: symbol.toUpperCase(),
      timeframe,
      data: historicalData,
      _metadata: {
        source: "mock",
        timestamp: Date.now(),
        dataPoints: historicalData.length,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Historical data API error:", error)

    // Return minimal fallback data
    const symbol = new URL(request.url).searchParams.get("symbol") || "AAPL"
    const fallbackData = generateHistoricalData(symbol, "1D", 7)

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      timeframe: "1D",
      data: fallbackData,
      _metadata: {
        source: "mock",
        timestamp: Date.now(),
        dataPoints: fallbackData.length,
        error: "Fallback data used",
      },
    })
  }
}
