import { type NextRequest, NextResponse } from "next/server"

// Get API keys from environment variables
const POLYGON_API_KEY = process.env.POLYGON_API_KEY
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

// Rate limiting tracking
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(provider: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const key = provider
  const current = requestCounts.get(key)

  if (!current || now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    console.warn(
      `⚠️ Rate limit exceeded for ${provider}. Waiting until ${new Date(current.resetTime).toLocaleTimeString()}`,
    )
    return false
  }

  current.count++
  return true
}

console.log("🔑 API Keys Status:", {
  polygon: POLYGON_API_KEY ? `✅ Available (${POLYGON_API_KEY.substring(0, 8)}...)` : "❌ Missing",
  alphaVantage: ALPHA_VANTAGE_API_KEY ? `✅ Available (${ALPHA_VANTAGE_API_KEY.substring(0, 8)}...)` : "❌ Missing",
})

async function fetchFromPolygon(symbol: string) {
  if (!POLYGON_API_KEY) {
    throw new Error("Polygon API key not configured")
  }

  // Check rate limit first
  if (!checkRateLimit("polygon", 4, 60000)) {
    throw new Error("Polygon rate limit exceeded - please wait or try Alpha Vantage")
  }

  console.log(`🔍 Fetching ${symbol} from Polygon.io...`)

  try {
    // Use the previous close endpoint which is more reliable
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${POLYGON_API_KEY}`
    console.log(`📡 Polygon URL: ${url.replace(POLYGON_API_KEY, "***API_KEY***")}`)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Options-Trading-Dashboard/1.0",
      },
    })

    console.log(`📊 Polygon Response Status: ${response.status}`)

    if (response.status === 429) {
      const errorText = await response.text()
      console.error(`❌ Polygon Rate Limit: ${errorText}`)
      throw new Error("Polygon rate limit exceeded - switching to Alpha Vantage")
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Polygon API Error: ${response.status} - ${errorText}`)
      throw new Error(`Polygon API HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log(`📈 Polygon Raw Data:`, JSON.stringify(data, null, 2))

    if (data.status !== "OK") {
      throw new Error(`Polygon API Status: ${data.status} - ${data.error || "Unknown error"}`)
    }

    if (!data.results || data.results.length === 0) {
      throw new Error("No Polygon data available for this symbol")
    }

    const result = data.results[0]

    // Calculate some basic metrics
    const price = result.c
    const open = result.o
    const change = price - open
    const changePercent = (change / open) * 100

    const quote = {
      symbol: symbol.toUpperCase(),
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: result.v?.toLocaleString() || "0",
      high: Number((result.h || 0).toFixed(2)),
      low: Number((result.l || 0).toFixed(2)),
      open: Number((result.o || 0).toFixed(2)),
      previousClose: Number((result.c || 0).toFixed(2)),
      lastUpdated: result.t || Date.now(),
    }

    console.log(`✅ Polygon Success for ${symbol}:`, quote)
    return quote
  } catch (error) {
    console.error(`❌ Polygon Error for ${symbol}:`, error)
    throw error
  }
}

async function fetchFromAlphaVantage(symbol: string) {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("Alpha Vantage API key not configured")
  }

  // Check rate limit first
  if (!checkRateLimit("alphavantage", 4, 60000)) {
    throw new Error("Alpha Vantage rate limit exceeded")
  }

  console.log(`🔍 Fetching ${symbol} from Alpha Vantage...`)

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    console.log(`📡 Alpha Vantage URL: ${url.replace(ALPHA_VANTAGE_API_KEY, "***API_KEY***")}`)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Options-Trading-Dashboard/1.0",
      },
    })

    console.log(`📊 Alpha Vantage Response Status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`Alpha Vantage API HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log(`📈 Alpha Vantage Raw Data:`, JSON.stringify(data, null, 2))

    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage Error: ${data["Error Message"]}`)
    }

    if (data["Note"]) {
      throw new Error(`Alpha Vantage Rate Limit: ${data["Note"]}`)
    }

    if (data["Information"]) {
      throw new Error(`Alpha Vantage Info: ${data["Information"]}`)
    }

    const quote = data["Global Quote"]
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error("No Alpha Vantage data available for this symbol")
    }

    const result = {
      symbol: quote["01. symbol"] || symbol.toUpperCase(),
      price: Number.parseFloat(quote["05. price"] || "0"),
      change: Number.parseFloat(quote["09. change"] || "0"),
      changePercent: Number.parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
      volume: quote["06. volume"] || "0",
      high: Number.parseFloat(quote["03. high"] || "0"),
      low: Number.parseFloat(quote["04. low"] || "0"),
      open: Number.parseFloat(quote["02. open"] || "0"),
      previousClose: Number.parseFloat(quote["08. previous close"] || "0"),
      lastUpdated: Date.now(),
    }

    console.log(`✅ Alpha Vantage Success for ${symbol}:`, result)
    return result
  } catch (error) {
    console.error(`❌ Alpha Vantage Error for ${symbol}:`, error)
    throw error
  }
}

function generateMockQuote(symbol: string) {
  const mockData = {
    AAPL: { base: 175, vol: "45M", change: 2.45 },
    TSLA: { base: 250, vol: "32M", change: -5.67 },
    SPY: { base: 445, vol: "78M", change: 1.87 },
    QQQ: { base: 378, vol: "45M", change: 2.34 },
    NVDA: { base: 495, vol: "41M", change: 12.34 },
    MSFT: { base: 415, vol: "22M", change: 1.23 },
    GOOGL: { base: 128, vol: "19M", change: -0.89 },
  }

  const mock = mockData[symbol.toUpperCase()] || { base: 100, vol: "10M", change: 0 }

  // Add small realistic variation
  const priceVariation = (Math.random() - 0.5) * 2
  const price = mock.base + priceVariation
  const change = mock.change + (Math.random() - 0.5) * 1
  const changePercent = (change / (price - change)) * 100

  return {
    symbol: symbol.toUpperCase(),
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: mock.vol,
    high: Number((price + Math.random() * 3).toFixed(2)),
    low: Number((price - Math.random() * 3).toFixed(2)),
    open: Number((price - change).toFixed(2)),
    previousClose: Number((price - change).toFixed(2)),
    lastUpdated: Date.now(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const provider = searchParams.get("provider") || "auto"

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    console.log(`\n🚀 === Fetching Quote for ${symbol.toUpperCase()} (Provider: ${provider}) ===`)

    let quote = null
    let dataSource = "mock"
    const errors = []

    // Try Alpha Vantage FIRST to avoid Polygon rate limits
    if (ALPHA_VANTAGE_API_KEY && (provider === "alpha-vantage" || provider === "auto")) {
      try {
        quote = await fetchFromAlphaVantage(symbol)
        dataSource = "alpha-vantage"
      } catch (alphaError) {
        console.warn(`⚠️ Alpha Vantage failed for ${symbol}:`, alphaError.message)
        errors.push(`Alpha Vantage: ${alphaError.message}`)
      }
    }

    // Try Polygon only if Alpha Vantage failed
    if (!quote && POLYGON_API_KEY && (provider === "polygon" || provider === "auto")) {
      try {
        quote = await fetchFromPolygon(symbol)
        dataSource = "polygon"
      } catch (polygonError) {
        console.warn(`⚠️ Polygon failed for ${symbol}:`, polygonError.message)
        errors.push(`Polygon: ${polygonError.message}`)
      }
    }

    // Use mock data as final fallback
    if (!quote) {
      console.log(`🎭 Using mock data for ${symbol}. API Errors: ${errors.join(", ")}`)
      quote = generateMockQuote(symbol)
      dataSource = "mock"
    }

    const response = {
      ...quote,
      _metadata: {
        source: dataSource,
        timestamp: Date.now(),
        provider: provider,
        errors: errors.length > 0 ? errors : undefined,
        rateLimited: errors.some((e) => e.includes("rate limit")),
        apiKeysAvailable: {
          polygon: !!POLYGON_API_KEY,
          alphaVantage: !!ALPHA_VANTAGE_API_KEY,
        },
      },
    }

    console.log(`✅ === Returning ${symbol} from ${dataSource.toUpperCase()} ===\n`)
    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Market Data API Fatal Error:", error)

    const symbol = new URL(request.url).searchParams.get("symbol") || "UNKNOWN"
    const mockQuote = generateMockQuote(symbol)

    return NextResponse.json({
      ...mockQuote,
      _metadata: {
        source: "mock",
        timestamp: Date.now(),
        provider: "fallback",
        error: error.message,
        fatal: true,
      },
    })
  }
}
