import { type NextRequest, NextResponse } from "next/server"

// Get API keys from environment variables
const POLYGON_API_KEY = process.env.POLYGON_API_KEY
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

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
  NVDA: {
    symbol: "NVDA",
    price: 875.28,
    change: 12.45,
    changePercent: 1.44,
    volume: "28,300,000",
    high: 882.5,
    low: 865.12,
    open: 870.25,
    previousClose: 862.83,
    marketCap: 2150000000000,
    lastUpdated: Date.now(),
  },
  MSFT: {
    symbol: "MSFT",
    price: 415.26,
    change: 3.21,
    changePercent: 0.78,
    volume: "22,100,000",
    high: 418.45,
    low: 412.33,
    open: 413.12,
    previousClose: 412.05,
    marketCap: 3080000000000,
    lastUpdated: Date.now(),
  },
}

function generateMockQuote(symbol: string) {
  // Use existing mock data if available, otherwise generate new
  const existingMock = mockQuotes[symbol.toUpperCase()]
  if (existingMock) {
    // Add some small random variation to make it feel live
    const variation = (Math.random() - 0.5) * 2 // +/- $1
    const newPrice = existingMock.price + variation
    const change = newPrice - existingMock.previousClose
    const changePercent = (change / existingMock.previousClose) * 100

    return {
      ...existingMock,
      price: Number.parseFloat(newPrice.toFixed(2)),
      change: Number.parseFloat(change.toFixed(2)),
      changePercent: Number.parseFloat(changePercent.toFixed(2)),
      lastUpdated: Date.now(),
    }
  }

  // Generate new mock data for unknown symbols
  const basePrice = 100 + Math.random() * 200
  const change = (Math.random() - 0.5) * 10
  const changePercent = (change / basePrice) * 100

  return {
    symbol: symbol.toUpperCase(),
    price: Number.parseFloat(basePrice.toFixed(2)),
    change: Number.parseFloat(change.toFixed(2)),
    changePercent: Number.parseFloat(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 10000000).toLocaleString(),
    high: Number.parseFloat((basePrice + Math.random() * 10).toFixed(2)),
    low: Number.parseFloat((basePrice - Math.random() * 10).toFixed(2)),
    open: Number.parseFloat((basePrice + (Math.random() - 0.5) * 5).toFixed(2)),
    previousClose: Number.parseFloat((basePrice - change).toFixed(2)),
    marketCap: Math.floor(Math.random() * 1000000000000),
    lastUpdated: Date.now(),
  }
}

async function fetchFromPolygon(symbol: string) {
  if (!POLYGON_API_KEY) {
    throw new Error("Polygon API key not configured")
  }

  try {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayStr = today.toISOString().split("T")[0]
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${yesterdayStr}/${todayStr}?adjusted=true&sort=desc&limit=2&apikey=${POLYGON_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`Polygon API HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      throw new Error("No Polygon data available")
    }

    const latest = data.results[0]
    const previous = data.results[1] || latest

    const currentPrice = latest.c
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
    throw error
  }
}

async function fetchFromAlphaVantage(symbol: string) {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("Alpha Vantage API key not configured")
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`Alpha Vantage API HTTP ${response.status}`)
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
  } catch (error) {
    throw error
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

    console.log(`Fetching quote for ${symbol} with provider: ${provider}`)

    let quote
    let dataSource = "mock"

    // Always try to get data, with fallback to mock
    try {
      // Try Polygon first (if provider is polygon or auto)
      if ((provider === "polygon" || provider === "auto") && POLYGON_API_KEY) {
        try {
          quote = await fetchFromPolygon(symbol)
          dataSource = "polygon"
          console.log(`Successfully fetched ${symbol} from Polygon`)
        } catch (polygonError) {
          console.warn(`Polygon failed for ${symbol}:`, polygonError.message)

          // Try Alpha Vantage as fallback
          if (provider === "auto" && ALPHA_VANTAGE_API_KEY) {
            try {
              quote = await fetchFromAlphaVantage(symbol)
              dataSource = "alpha-vantage"
              console.log(`Successfully fetched ${symbol} from Alpha Vantage`)
            } catch (alphaError) {
              console.warn(`Alpha Vantage failed for ${symbol}:`, alphaError.message)
              // Will fall through to mock data
            }
          }
        }
      }
      // Try Alpha Vantage first (if provider is alpha-vantage)
      else if (provider === "alpha-vantage" && ALPHA_VANTAGE_API_KEY) {
        try {
          quote = await fetchFromAlphaVantage(symbol)
          dataSource = "alpha-vantage"
          console.log(`Successfully fetched ${symbol} from Alpha Vantage`)
        } catch (alphaError) {
          console.warn(`Alpha Vantage failed for ${symbol}:`, alphaError.message)
          // Will fall through to mock data
        }
      }

      // If no quote yet, use mock data
      if (!quote) {
        quote = generateMockQuote(symbol)
        dataSource = "mock"
        console.log(`Using mock data for ${symbol}`)
      }
    } catch (error) {
      // Final fallback to mock data
      console.error(`All providers failed for ${symbol}, using mock data:`, error)
      quote = generateMockQuote(symbol)
      dataSource = "mock"
    }

    // Add metadata about data source
    const response = {
      ...quote,
      _metadata: {
        source: dataSource,
        timestamp: Date.now(),
        provider: provider,
      },
    }

    console.log(`Returning quote for ${symbol} from ${dataSource}`)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Market data API error:", error)

    // Even if everything fails, return mock data instead of 500 error
    const symbol = new URL(request.url).searchParams.get("symbol") || "UNKNOWN"
    const mockQuote = generateMockQuote(symbol)

    return NextResponse.json({
      ...mockQuote,
      _metadata: {
        source: "mock",
        timestamp: Date.now(),
        provider: "fallback",
        error: "API error, using mock data",
      },
    })
  }
}
