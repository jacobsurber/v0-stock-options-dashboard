import { type NextRequest, NextResponse } from "next/server"

// Your Polygon.io API key
const POLYGON_API_KEY = "hoqphq9tFcgd8ZqOq97FZbHblrBEFesd"

// Mock data as fallback
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
  SPY: {
    symbol: "SPY",
    price: 445.23,
    change: 1.87,
    changePercent: 0.42,
    volume: "78,500,000",
    high: 446.12,
    low: 443.45,
    open: 444.12,
    previousClose: 443.36,
    lastUpdated: Date.now(),
  },
}

async function fetchFromPolygon(symbol: string) {
  try {
    // Use the aggregates endpoint for more reliable data
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Format dates as YYYY-MM-DD
    const todayStr = today.toISOString().split("T")[0]
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${yesterdayStr}/${todayStr}?adjusted=true&sort=desc&limit=2&apikey=${POLYGON_API_KEY}`,
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid Polygon.io API key. Please check your API key.")
      }
      if (response.status === 403) {
        throw new Error("Polygon.io API access denied. Please check your subscription.")
      }
      if (response.status === 429) {
        throw new Error("Polygon.io rate limit exceeded. Please wait before making more requests.")
      }
      throw new Error(`Polygon.io API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Polygon.io API error: ${data.error || "Unknown error"}`)
    }

    if (!data.results || data.results.length === 0) {
      throw new Error(`No data available for symbol ${symbol} from Polygon.io`)
    }

    // Get the most recent data point
    const latest = data.results[0]
    const previous = data.results[1] || latest

    const currentPrice = latest.c // close price
    const previousClose = previous.c
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100

    return {
      symbol: symbol.toUpperCase(),
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: latest.v?.toLocaleString() || "0",
      high: latest.h || 0,
      low: latest.l || 0,
      open: latest.o || 0,
      previousClose: previousClose,
      lastUpdated: latest.t || Date.now(),
    }
  } catch (error) {
    console.error(`Polygon API error for ${symbol}:`, error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const provider = searchParams.get("provider") || "polygon"

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    let quote

    try {
      if (provider === "polygon") {
        quote = await fetchFromPolygon(symbol)
      } else {
        // Use mock data for other providers or as fallback
        quote = mockQuotes[symbol.toUpperCase()] || {
          ...mockQuotes.AAPL,
          symbol: symbol.toUpperCase(),
          price: 100 + Math.random() * 50,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
        }

        // Add some randomness to mock data
        quote = {
          ...quote,
          price: quote.price + (Math.random() - 0.5) * 2,
          change: quote.change + (Math.random() - 0.5) * 0.5,
          lastUpdated: Date.now(),
        }
        quote.changePercent = (quote.change / (quote.price - quote.change)) * 100
      }

      return NextResponse.json(quote)
    } catch (apiError) {
      console.warn(`API error for ${provider}, falling back to mock data:`, apiError)

      // Fallback to mock data
      quote = mockQuotes[symbol.toUpperCase()] || {
        ...mockQuotes.AAPL,
        symbol: symbol.toUpperCase(),
        price: 100 + Math.random() * 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
      }

      // Add some randomness to mock data
      quote = {
        ...quote,
        price: quote.price + (Math.random() - 0.5) * 2,
        change: quote.change + (Math.random() - 0.5) * 0.5,
        lastUpdated: Date.now(),
      }
      quote.changePercent = (quote.change / (quote.price - quote.change)) * 100

      return NextResponse.json(quote)
    }
  } catch (error) {
    console.error("Market data API error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
