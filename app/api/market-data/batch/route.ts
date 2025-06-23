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

console.log("🔑 Batch API Keys Status:", {
  polygon: POLYGON_API_KEY ? `✅ Available (${POLYGON_API_KEY.substring(0, 8)}...)` : "❌ Missing",
  alphaVantage: ALPHA_VANTAGE_API_KEY ? `✅ Available (${ALPHA_VANTAGE_API_KEY.substring(0, 8)}...)` : "❌ Missing",
})

async function fetchBatchFromPolygon(symbols: string[]) {
  if (!POLYGON_API_KEY) {
    throw new Error("Polygon API key not configured")
  }

  // Check rate limit - Polygon free tier: 5 requests per minute
  if (!checkRateLimit("polygon", 4, 60000)) {
    throw new Error("Polygon rate limit exceeded - switching to Alpha Vantage")
  }

  console.log(`🔍 Fetching batch data for ${symbols.join(", ")} from Polygon.io...`)

  try {
    // Limit to first 3 symbols to avoid rate limits
    const limitedSymbols = symbols.slice(0, 3)
    console.log(`⚡ Rate limiting: fetching only ${limitedSymbols.length} symbols to avoid 429 errors`)

    const results = []

    // Fetch symbols one by one with delays
    for (let i = 0; i < limitedSymbols.length; i++) {
      const symbol = limitedSymbols[i]

      try {
        const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${POLYGON_API_KEY}`
        console.log(`📡 Polygon URL for ${symbol}: ${url.replace(POLYGON_API_KEY, "***API_KEY***")}`)

        const response = await fetch(url, {
          headers: {
            "User-Agent": "Options-Trading-Dashboard/1.0",
          },
        })

        if (response.status === 429) {
          console.warn(`⚠️ Polygon rate limit hit for ${symbol} - stopping batch`)
          throw new Error("Polygon rate limit exceeded")
        }

        if (!response.ok) {
          throw new Error(`Polygon API HTTP ${response.status} for ${symbol}`)
        }

        const data = await response.json()

        if (data.status !== "OK" || !data.results || data.results.length === 0) {
          console.warn(`⚠️ No Polygon data for ${symbol}`)
          continue
        }

        const result = data.results[0]
        const price = result.c
        const open = result.o
        const change = price - open
        const changePercent = (change / open) * 100

        results.push({
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
        })

        // Add delay between requests to avoid rate limiting
        if (i < limitedSymbols.length - 1) {
          console.log(`⏱️ Waiting 15 seconds before next Polygon request...`)
          await new Promise((resolve) => setTimeout(resolve, 15000))
        }
      } catch (error) {
        console.warn(`⚠️ Polygon failed for ${symbol}:`, error.message)
        if (error.message.includes("rate limit")) {
          throw error // Stop trying if we hit rate limit
        }
      }
    }

    if (results.length === 0) {
      throw new Error("No successful Polygon results")
    }

    console.log(`✅ Polygon batch success: ${results.length}/${limitedSymbols.length} symbols`)
    return results
  } catch (error) {
    console.error(`❌ Polygon batch error:`, error)
    throw error
  }
}

async function fetchBatchFromAlphaVantage(symbols: string[]) {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("Alpha Vantage API key not configured")
  }

  // Check rate limit - Alpha Vantage free tier: 25 requests per day, 5 per minute
  if (!checkRateLimit("alphavantage", 4, 60000)) {
    throw new Error("Alpha Vantage rate limit exceeded")
  }

  console.log(`🔍 Fetching batch data for ${symbols.join(", ")} from Alpha Vantage...`)

  try {
    const results = []
    // Limit to 3 symbols to avoid rate limits
    const limitedSymbols = symbols.slice(0, 3)

    for (let i = 0; i < limitedSymbols.length; i++) {
      const symbol = limitedSymbols[i]

      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        console.log(`📡 Alpha Vantage URL for ${symbol}: ${url.replace(ALPHA_VANTAGE_API_KEY, "***API_KEY***")}`)

        const response = await fetch(url, {
          headers: {
            "User-Agent": "Options-Trading-Dashboard/1.0",
          },
        })

        if (!response.ok) {
          throw new Error(`Alpha Vantage API HTTP ${response.status} for ${symbol}`)
        }

        const data = await response.json()

        if (data["Error Message"] || data["Note"] || data["Information"]) {
          const errorMsg = data["Error Message"] || data["Note"] || data["Information"]
          console.warn(`⚠️ Alpha Vantage error for ${symbol}: ${errorMsg}`)

          if (errorMsg.includes("rate limit") || errorMsg.includes("frequency")) {
            throw new Error("Alpha Vantage rate limit exceeded")
          }
          continue
        }

        const quote = data["Global Quote"]
        if (!quote || Object.keys(quote).length === 0) {
          console.warn(`⚠️ No Alpha Vantage data for ${symbol}`)
          continue
        }

        results.push({
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
        })

        // Add delay between requests
        if (i < limitedSymbols.length - 1) {
          console.log(`⏱️ Waiting 15 seconds before next Alpha Vantage request...`)
          await new Promise((resolve) => setTimeout(resolve, 15000))
        }
      } catch (error) {
        console.warn(`⚠️ Alpha Vantage failed for ${symbol}:`, error.message)
        if (error.message.includes("rate limit")) {
          throw error
        }
      }
    }

    if (results.length === 0) {
      throw new Error("No successful Alpha Vantage results")
    }

    console.log(`✅ Alpha Vantage batch success: ${results.length}/${limitedSymbols.length} symbols`)
    return results
  } catch (error) {
    console.error(`❌ Alpha Vantage batch error:`, error)
    throw error
  }
}

function generateMockBatch(symbols: string[]) {
  const mockData = {
    AAPL: { base: 175, vol: "45M", change: 2.45 },
    TSLA: { base: 250, vol: "32M", change: -5.67 },
    SPY: { base: 445, vol: "78M", change: 1.87 },
    QQQ: { base: 378, vol: "45M", change: 2.34 },
    NVDA: { base: 495, vol: "41M", change: 12.34 },
    MSFT: { base: 415, vol: "22M", change: 1.23 },
    GOOGL: { base: 128, vol: "19M", change: -0.89 },
  }

  return symbols.map((symbol) => {
    const mock = mockData[symbol.toUpperCase()] || { base: 100, vol: "10M", change: 0 }

    // Add some realistic variation but keep it stable
    const priceVariation = (Math.random() - 0.5) * 2 // +/- $1
    const price = mock.base + priceVariation
    const change = mock.change + (Math.random() - 0.5) * 1 // Small variation in change
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
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get("symbols")
    const provider = searchParams.get("provider") || "auto"

    if (!symbolsParam) {
      return NextResponse.json({ error: "Symbols parameter is required" }, { status: 400 })
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase())
    console.log(`\n🚀 === Fetching Batch Quotes for ${symbols.join(", ")} (Provider: ${provider}) ===`)

    let quotes = []
    let dataSource = "mock"
    const errors = []

    // Try Alpha Vantage FIRST to avoid Polygon rate limits
    if (ALPHA_VANTAGE_API_KEY && (provider === "alpha-vantage" || provider === "auto")) {
      try {
        quotes = await fetchBatchFromAlphaVantage(symbols)
        dataSource = "alpha-vantage"
      } catch (alphaError) {
        console.warn(`⚠️ Alpha Vantage batch failed:`, alphaError.message)
        errors.push(`Alpha Vantage: ${alphaError.message}`)
      }
    }

    // Try Polygon only if Alpha Vantage failed and we haven't hit rate limits
    if (quotes.length === 0 && POLYGON_API_KEY && (provider === "polygon" || provider === "auto")) {
      try {
        quotes = await fetchBatchFromPolygon(symbols)
        dataSource = "polygon"
      } catch (polygonError) {
        console.warn(`⚠️ Polygon batch failed:`, polygonError.message)
        errors.push(`Polygon: ${polygonError.message}`)
      }
    }

    // Use mock data as final fallback
    if (quotes.length === 0) {
      console.log(`🎭 Using mock batch data for ${symbols.join(", ")}. API Errors: ${errors.join(", ")}`)
      quotes = generateMockBatch(symbols)
      dataSource = "mock"
    }

    // If we only got partial results from APIs, fill in the rest with mock data
    if (quotes.length < symbols.length && dataSource !== "mock") {
      const missingSymbols = symbols.filter((symbol) => !quotes.find((q) => q.symbol === symbol))
      const mockQuotes = generateMockBatch(missingSymbols)
      quotes = [...quotes, ...mockQuotes]
      console.log(`📝 Added mock data for missing symbols: ${missingSymbols.join(", ")}`)
    }

    // Add metadata to each quote
    const quotesWithMetadata = quotes.map((quote) => ({
      ...quote,
      _metadata: {
        source: dataSource,
        timestamp: Date.now(),
        provider: provider,
        rateLimited: errors.some((e) => e.includes("rate limit")),
      },
    }))

    console.log(`✅ === Returning ${quotes.length} quotes from ${dataSource.toUpperCase()} ===\n`)
    return NextResponse.json(quotesWithMetadata)
  } catch (error) {
    console.error("❌ Batch Market Data API Fatal Error:", error)

    const symbolsParam = new URL(request.url).searchParams.get("symbols") || "AAPL"
    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase())
    const mockQuotes = generateMockBatch(symbols)

    return NextResponse.json(
      mockQuotes.map((quote) => ({
        ...quote,
        _metadata: {
          source: "mock",
          timestamp: Date.now(),
          provider: "fallback",
          error: error.message,
          fatal: true,
        },
      })),
    )
  }
}
