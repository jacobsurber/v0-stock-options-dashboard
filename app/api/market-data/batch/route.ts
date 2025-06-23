import { type NextRequest, NextResponse } from "next/server"

// API Keys
const POLYGON_API_KEY = "hoqphq9tFcgd8ZqOq97FZbHblrBEFesd"
const ALPHA_VANTAGE_API_KEY = "17YSD7U2HWJEWTCU"

// Rate limiting for both APIs
let polygonCallCount = 0
let alphaVantageCallCount = 0
let lastPolygonReset = Date.now()
let lastAlphaVantageReset = Date.now()

const POLYGON_RATE_LIMIT = 4 // 4 calls per minute
const ALPHA_VANTAGE_RATE_LIMIT = 4 // 5 calls per minute, being conservative
const RESET_INTERVAL = 60000 // 1 minute

// Mock data for ultimate fallback
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
  QQQ: {
    symbol: "QQQ",
    price: 378.45,
    change: 2.34,
    changePercent: 0.62,
    volume: "45,200,000",
    high: 379.12,
    low: 376.23,
    open: 376.89,
    previousClose: 376.11,
    lastUpdated: Date.now(),
  },
}

function checkPolygonRateLimit(): boolean {
  const now = Date.now()
  if (now - lastPolygonReset > RESET_INTERVAL) {
    polygonCallCount = 0
    lastPolygonReset = now
  }
  return polygonCallCount < POLYGON_RATE_LIMIT
}

function checkAlphaVantageRateLimit(): boolean {
  const now = Date.now()
  if (now - lastAlphaVantageReset > RESET_INTERVAL) {
    alphaVantageCallCount = 0
    lastAlphaVantageReset = now
  }
  return alphaVantageCallCount < ALPHA_VANTAGE_RATE_LIMIT
}

async function fetchFromPolygon(symbol: string): Promise<any> {
  if (!checkPolygonRateLimit()) {
    throw new Error("Polygon rate limit exceeded")
  }

  polygonCallCount++

  const today = new Date()
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const todayStr = today.toISOString().split("T")[0]
  const oneWeekAgoStr = oneWeekAgo.toISOString().split("T")[0]

  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${oneWeekAgoStr}/${todayStr}?adjusted=true&sort=desc&limit=10&apikey=${POLYGON_API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Polygon HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    throw new Error("No Polygon data available")
  }

  const latest = data.results[0]
  const previous = data.results[1] || latest

  const currentPrice = latest.c || 0
  const previousClose = previous.c || currentPrice
  const change = currentPrice - previousClose
  const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

  return {
    symbol: symbol.toUpperCase(),
    price: Number(currentPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: latest.v?.toLocaleString() || "0",
    high: Number((latest.h || 0).toFixed(2)),
    low: Number((latest.l || 0).toFixed(2)),
    open: Number((latest.o || 0).toFixed(2)),
    previousClose: Number(previousClose.toFixed(2)),
    lastUpdated: latest.t || Date.now(),
    source: "polygon",
  }
}

async function fetchFromAlphaVantage(symbol: string): Promise<any> {
  if (!checkAlphaVantageRateLimit()) {
    throw new Error("Alpha Vantage rate limit exceeded")
  }

  alphaVantageCallCount++

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Alpha Vantage HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data["Error Message"] || data["Note"]) {
    throw new Error(data["Error Message"] || data["Note"] || "Alpha Vantage API error")
  }

  const quote = data["Global Quote"]
  if (!quote) {
    throw new Error("No Alpha Vantage data available")
  }

  return {
    symbol: quote["01. symbol"] || symbol.toUpperCase(),
    price: Number(Number.parseFloat(quote["05. price"] || "0").toFixed(2)),
    change: Number(Number.parseFloat(quote["09. change"] || "0").toFixed(2)),
    changePercent: Number(Number.parseFloat(quote["10. change percent"]?.replace("%", "") || "0").toFixed(2)),
    volume: quote["06. volume"] || "0",
    high: Number(Number.parseFloat(quote["03. high"] || "0").toFixed(2)),
    low: Number(Number.parseFloat(quote["04. low"] || "0").toFixed(2)),
    open: Number(Number.parseFloat(quote["02. open"] || "0").toFixed(2)),
    previousClose: Number(Number.parseFloat(quote["08. previous close"] || "0").toFixed(2)),
    lastUpdated: Date.now(),
    source: "alpha-vantage",
  }
}

async function fetchQuoteWithFallback(symbol: string): Promise<any> {
  // Try Polygon first
  try {
    console.log(`Trying Polygon for ${symbol}`)
    return await fetchFromPolygon(symbol)
  } catch (polygonError) {
    console.warn(`Polygon failed for ${symbol}:`, polygonError.message)

    // Try Alpha Vantage as fallback
    try {
      console.log(`Trying Alpha Vantage fallback for ${symbol}`)
      return await fetchFromAlphaVantage(symbol)
    } catch (alphaError) {
      console.warn(`Alpha Vantage failed for ${symbol}:`, alphaError.message)

      // Use mock data as final fallback
      console.log(`Using mock data for ${symbol}`)
      const baseQuote = mockQuotes[symbol] || mockQuotes.AAPL
      const mockPrice = baseQuote.price + (Math.random() - 0.5) * 5
      const mockChange = (Math.random() - 0.5) * 3

      return {
        symbol: symbol.toUpperCase(),
        price: Number(mockPrice.toFixed(2)),
        change: Number(mockChange.toFixed(2)),
        changePercent: Number(((mockChange / (mockPrice - mockChange)) * 100).toFixed(2)),
        volume: baseQuote.volume,
        high: Number((mockPrice + Math.random() * 3).toFixed(2)),
        low: Number((mockPrice - Math.random() * 3).toFixed(2)),
        open: Number((mockPrice + (Math.random() - 0.5) * 2).toFixed(2)),
        previousClose: Number((mockPrice - mockChange).toFixed(2)),
        lastUpdated: Date.now(),
        source: "mock",
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get("symbols")

    if (!symbolsParam) {
      return NextResponse.json({ error: "Symbols parameter is required" }, { status: 400 })
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase())
    console.log(`Fetching quotes for symbols: ${symbols.join(", ")}`)

    const quotes = []

    // Process symbols with intelligent fallback
    for (const symbol of symbols) {
      const quote = await fetchQuoteWithFallback(symbol)
      quotes.push(quote)

      // Small delay between requests
      if (symbols.indexOf(symbol) < symbols.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(`Successfully returned ${quotes.length} quotes`)
    console.log(`Sources used:`, quotes.map((q) => `${q.symbol}:${q.source}`).join(", "))

    return NextResponse.json(quotes)
  } catch (error) {
    console.error("Batch market data API error:", error)
    return NextResponse.json({ error: "Failed to fetch batch market data" }, { status: 500 })
  }
}
