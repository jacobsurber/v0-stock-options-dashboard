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
  MSFT: {
    symbol: "MSFT",
    price: 342.15,
    change: 1.23,
    changePercent: 0.36,
    volume: "28,900,000",
    high: 343.42,
    low: 341.15,
    open: 341.92,
    previousClose: 340.92,
    marketCap: 2540000000000,
    lastUpdated: Date.now(),
  },
  GOOGL: {
    symbol: "GOOGL",
    price: 128.45,
    change: -0.89,
    changePercent: -0.69,
    volume: "19,700,000",
    high: 129.34,
    low: 128.45,
    open: 129.34,
    previousClose: 129.34,
    marketCap: 1620000000000,
    lastUpdated: Date.now(),
  },
  NVDA: {
    symbol: "NVDA",
    price: 495.22,
    change: 12.34,
    changePercent: 2.55,
    volume: "41,800,000",
    high: 498.45,
    low: 482.88,
    open: 482.88,
    previousClose: 482.88,
    marketCap: 1220000000000,
    lastUpdated: Date.now(),
  },
}

async function fetchBatchFromPolygon(symbols: string[]) {
  const apiKey = process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY

  if (!apiKey) {
    throw new Error("Polygon.io API key not configured")
  }

  // Polygon doesn't have a direct batch endpoint for quotes, so we'll make individual requests
  // In production, you might want to use their WebSocket API for real-time data
  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        // Use the aggregates endpoint for more reliable data
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // Format dates as YYYY-MM-DD
        const todayStr = today.toISOString().split("T")[0]
        const yesterdayStr = yesterday.toISOString().split("T")[0]

        // Try to get current day data first
        const response = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${yesterdayStr}/${todayStr}?adjusted=true&sort=desc&limit=2&apikey=${apiKey}`,
        )

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(`Invalid Polygon.io API key`)
          }
          if (response.status === 403) {
            throw new Error(`Polygon.io API access denied. Please check your subscription.`)
          }
          if (response.status === 429) {
            throw new Error(`Polygon.io rate limit exceeded`)
          }
          throw new Error(`Polygon API error for ${symbol}: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (data.status !== "OK") {
          throw new Error(`Polygon API error for ${symbol}: ${data.error || "Unknown error"}`)
        }

        if (!data.results || data.results.length === 0) {
          throw new Error(`No data available for symbol ${symbol}`)
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
        console.error(`Error fetching ${symbol} from Polygon:`, error)
        // Return mock data for failed symbols
        const mockPrice = 100 + Math.random() * 50
        const mockChange = (Math.random() - 0.5) * 10
        return {
          symbol: symbol.toUpperCase(),
          price: mockPrice,
          change: mockChange,
          changePercent: (mockChange / (mockPrice - mockChange)) * 100,
          volume: "1,000,000",
          high: mockPrice + 5,
          low: mockPrice - 5,
          open: mockPrice + (Math.random() - 0.5) * 2,
          previousClose: mockPrice - mockChange,
          lastUpdated: Date.now(),
        }
      }
    }),
  )

  return quotes
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get("symbols")
    const provider = searchParams.get("provider") || "mock"

    if (!symbolsParam) {
      return NextResponse.json({ error: "Symbols parameter is required" }, { status: 400 })
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase())

    let quotes

    try {
      switch (provider) {
        case "polygon":
          quotes = await fetchBatchFromPolygon(symbols)
          break
        case "mock":
        default:
          // Use mock data with some randomness
          quotes = symbols.map((symbol) => {
            let quote = mockQuotes[symbol] || {
              ...mockQuotes.AAPL,
              symbol: symbol,
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

            return quote
          })
          break
      }

      return NextResponse.json(quotes)
    } catch (apiError) {
      console.warn(`API error for ${provider}, falling back to mock data:`, apiError)

      // Fallback to mock data
      quotes = symbols.map((symbol) => {
        let quote = mockQuotes[symbol] || {
          ...mockQuotes.AAPL,
          symbol: symbol,
          price: 100 + Math.random() * 50,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
        }

        // Add some randomness
        quote = {
          ...quote,
          price: quote.price + (Math.random() - 0.5) * 2,
          change: quote.change + (Math.random() - 0.5) * 0.5,
          lastUpdated: Date.now(),
        }
        quote.changePercent = (quote.change / (quote.price - quote.change)) * 100

        return quote
      })

      return NextResponse.json(quotes)
    }
  } catch (error) {
    console.error("Batch market data API error:", error)
    return NextResponse.json({ error: "Failed to fetch batch market data" }, { status: 500 })
  }
}
