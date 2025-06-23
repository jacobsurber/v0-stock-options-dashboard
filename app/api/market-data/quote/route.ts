import { type NextRequest, NextResponse } from "next/server"

// Mock data for development
const mockQuotes: { [key: string]: any } = {
  AAPL: {
    symbol: "AAPL",
    price: 157.82,
    change: 2.45,
    changePercent: 1.58,
    volume: "45,200,000",
    high: 158.91,
    low: 154.82,
    open: 155.37,
    previousClose: 155.37,
    marketCap: 2450000000000,
    lastUpdated: Date.now(),
  },
  TSLA: {
    symbol: "TSLA",
    price: 248.91,
    change: -5.67,
    changePercent: -2.23,
    volume: "32,100,000",
    high: 254.58,
    low: 248.91,
    open: 254.58,
    previousClose: 254.58,
    marketCap: 789200000000,
    lastUpdated: Date.now(),
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const provider = searchParams.get("provider") || "mock"

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    const upperSymbol = symbol.toUpperCase()

    // For now, return mock data with some randomness
    let quote = mockQuotes[upperSymbol] || {
      ...mockQuotes.AAPL,
      symbol: upperSymbol,
      price: 100 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
    }

    // Add some randomness to make it feel live
    quote = {
      ...quote,
      price: quote.price + (Math.random() - 0.5) * 2,
      change: quote.change + (Math.random() - 0.5) * 0.5,
      lastUpdated: Date.now(),
    }
    quote.changePercent = (quote.change / (quote.price - quote.change)) * 100

    return NextResponse.json(quote)
  } catch (error) {
    console.error("Quote API error:", error)
    return NextResponse.json({ error: "Failed to fetch quote data" }, { status: 500 })
  }
}
