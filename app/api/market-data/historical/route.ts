import { type NextRequest, NextResponse } from "next/server"

// Get API keys from environment variables
const POLYGON_API_KEY = process.env.POLYGON_API_KEY
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

async function fetchHistoricalFromPolygon(symbol: string, timeframe: string, days: number) {
  if (!POLYGON_API_KEY) {
    throw new Error("Polygon API key not configured")
  }

  console.log(`🔍 Fetching historical data for ${symbol} from Polygon.io...`)

  try {
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    // Map timeframe to Polygon parameters
    let multiplier = 1
    let timespan = "day"

    switch (timeframe) {
      case "1m":
        multiplier = 1
        timespan = "minute"
        break
      case "5m":
        multiplier = 5
        timespan = "minute"
        break
      case "15m":
        multiplier = 15
        timespan = "minute"
        break
      case "1H":
        multiplier = 1
        timespan = "hour"
        break
      case "4H":
        multiplier = 4
        timespan = "hour"
        break
      case "1D":
      case "5D":
      case "1M":
      case "3M":
      case "6M":
      case "1Y":
        multiplier = 1
        timespan = "day"
        break
    }

    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${startDateStr}/${endDateStr}?adjusted=true&sort=asc&limit=5000&apikey=${POLYGON_API_KEY}`
    console.log(`📡 Polygon Historical URL: ${url.replace(POLYGON_API_KEY, "***API_KEY***")}`)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Options-Trading-Dashboard/1.0",
      },
    })

    console.log(`📊 Polygon Historical Response Status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Polygon Historical API Error: ${response.status} - ${errorText}`)
      throw new Error(`Polygon Historical API HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log(`📈 Polygon Historical Raw Data:`, JSON.stringify(data, null, 2))

    if (data.status !== "OK") {
      throw new Error(`Polygon Historical API Status: ${data.status} - ${data.error || "Unknown error"}`)
    }

    if (!data.results || data.results.length === 0) {
      throw new Error("No Polygon historical data available for this symbol")
    }

    const historicalData = data.results.map((item: any) => ({
      timestamp: item.t,
      open: Number(item.o.toFixed(2)),
      high: Number(item.h.toFixed(2)),
      low: Number(item.l.toFixed(2)),
      close: Number(item.c.toFixed(2)),
      volume: item.v || 0,
    }))

    console.log(`✅ Polygon Historical Success for ${symbol}: ${historicalData.length} data points`)
    return historicalData
  } catch (error) {
    console.error(`❌ Polygon Historical Error for ${symbol}:`, error)
    throw error
  }
}

async function fetchHistoricalFromAlphaVantage(symbol: string, timeframe: string) {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error("Alpha Vantage API key not configured")
  }

  console.log(`🔍 Fetching historical data for ${symbol} from Alpha Vantage...`)

  try {
    // Map timeframe to Alpha Vantage function
    let func = "TIME_SERIES_DAILY"
    let key = "Time Series (Daily)"

    switch (timeframe) {
      case "1m":
        func = "TIME_SERIES_INTRADAY"
        key = "Time Series (1min)"
        break
      case "5m":
        func = "TIME_SERIES_INTRADAY"
        key = "Time Series (5min)"
        break
      case "15m":
        func = "TIME_SERIES_INTRADAY"
        key = "Time Series (15min)"
        break
      case "1H":
        func = "TIME_SERIES_INTRADAY"
        key = "Time Series (60min)"
        break
      default:
        func = "TIME_SERIES_DAILY"
        key = "Time Series (Daily)"
    }

    let url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`

    if (func === "TIME_SERIES_INTRADAY") {
      const interval = timeframe === "1H" ? "60min" : timeframe
      url += `&interval=${interval}`
    }

    console.log(`📡 Alpha Vantage Historical URL: ${url.replace(ALPHA_VANTAGE_API_KEY, "***API_KEY***")}`)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Options-Trading-Dashboard/1.0",
      },
    })

    console.log(`📊 Alpha Vantage Historical Response Status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`Alpha Vantage Historical API HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log(`📈 Alpha Vantage Historical Raw Data:`, JSON.stringify(data, null, 2))

    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage Historical Error: ${data["Error Message"]}`)
    }

    if (data["Note"]) {
      throw new Error(`Alpha Vantage Historical Rate Limit: ${data["Note"]}`)
    }

    if (data["Information"]) {
      throw new Error(`Alpha Vantage Historical Info: ${data["Information"]}`)
    }

    const timeSeries = data[key]
    if (!timeSeries || Object.keys(timeSeries).length === 0) {
      throw new Error("No Alpha Vantage historical data available for this symbol")
    }

    const historicalData = Object.entries(timeSeries)
      .map(([timestamp, values]: [string, any]) => ({
        timestamp: new Date(timestamp).getTime(),
        open: Number.parseFloat(values["1. open"]),
        high: Number.parseFloat(values["2. high"]),
        low: Number.parseFloat(values["3. low"]),
        close: Number.parseFloat(values["4. close"]),
        volume: Number.parseInt(values["5. volume"] || "0"),
      }))
      .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp ascending

    console.log(`✅ Alpha Vantage Historical Success for ${symbol}: ${historicalData.length} data points`)
    return historicalData
  } catch (error) {
    console.error(`❌ Alpha Vantage Historical Error for ${symbol}:`, error)
    throw error
  }
}

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
    const provider = searchParams.get("provider") || "auto"

    console.log(`\n🚀 === Fetching Historical Data for ${symbol} (${timeframe}, Provider: ${provider}) ===`)

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

    let historicalData = []
    let dataSource = "mock"
    const errors = []

    // Try Polygon first if available
    if (POLYGON_API_KEY && (provider === "polygon" || provider === "auto")) {
      try {
        historicalData = await fetchHistoricalFromPolygon(symbol, timeframe, days)
        dataSource = "polygon"
      } catch (polygonError) {
        console.warn(`⚠️ Polygon historical failed for ${symbol}:`, polygonError.message)
        errors.push(`Polygon: ${polygonError.message}`)
      }
    }

    // Try Alpha Vantage if Polygon failed or if specifically requested
    if (historicalData.length === 0 && ALPHA_VANTAGE_API_KEY && (provider === "alpha-vantage" || provider === "auto")) {
      try {
        historicalData = await fetchHistoricalFromAlphaVantage(symbol, timeframe)
        dataSource = "alpha-vantage"
      } catch (alphaError) {
        console.warn(`⚠️ Alpha Vantage historical failed for ${symbol}:`, alphaError.message)
        errors.push(`Alpha Vantage: ${alphaError.message}`)
      }
    }

    // Use mock data as final fallback
    if (historicalData.length === 0) {
      console.log(`🎭 Using mock historical data for ${symbol}. API Errors: ${errors.join(", ")}`)
      historicalData = generateHistoricalData(symbol, timeframe, days)
      dataSource = "mock"
    }

    const response = {
      symbol: symbol.toUpperCase(),
      timeframe,
      data: historicalData,
      _metadata: {
        source: dataSource,
        timestamp: Date.now(),
        dataPoints: historicalData.length,
        errors: errors.length > 0 ? errors : undefined,
        apiKeysAvailable: {
          polygon: !!POLYGON_API_KEY,
          alphaVantage: !!ALPHA_VANTAGE_API_KEY,
        },
      },
    }

    console.log(
      `✅ === Returning ${historicalData.length} historical data points from ${dataSource.toUpperCase()} ===\n`,
    )
    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Historical Data API Fatal Error:", error)

    // Return minimal fallback data
    const symbol = new URL(request.url).searchParams.get("symbol") || "AAPL"
    const timeframe = new URL(request.url).searchParams.get("timeframe") || "1D"
    const fallbackData = generateHistoricalData(symbol, timeframe, 7)

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      timeframe: timeframe,
      data: fallbackData,
      _metadata: {
        source: "mock",
        timestamp: Date.now(),
        dataPoints: fallbackData.length,
        error: error.message,
        fatal: true,
      },
    })
  }
}
