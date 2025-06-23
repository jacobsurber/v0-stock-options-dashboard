import { type NextRequest, NextResponse } from "next/server"

// API Keys (server-side only)
const POLYGON_API_KEY = process.env.POLYGON_API_KEY || "hoqphq9tFcgd8ZqOq97FZbHblrBEFesd"
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "17YSD7U2HWJEWTCU"

// Rate limiting
let polygonCallCount = 0
let alphaVantageCallCount = 0
let lastPolygonReset = Date.now()
let lastAlphaVantageReset = Date.now()

const POLYGON_RATE_LIMIT = 4
const ALPHA_VANTAGE_RATE_LIMIT = 4
const RESET_INTERVAL = 60000

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

async function fetchHistoricalFromPolygon(symbol: string, timeframe: string, limit = 100) {
  if (!checkPolygonRateLimit()) {
    throw new Error("Polygon rate limit exceeded")
  }

  polygonCallCount++

  const endDate = new Date()
  const startDate = new Date()

  // Calculate start date based on timeframe
  switch (timeframe) {
    case "1D":
      startDate.setDate(endDate.getDate() - 1)
      break
    case "5D":
      startDate.setDate(endDate.getDate() - 5)
      break
    case "1M":
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case "3M":
      startDate.setMonth(endDate.getMonth() - 3)
      break
    case "6M":
      startDate.setMonth(endDate.getMonth() - 6)
      break
    case "1Y":
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    default:
      startDate.setDate(endDate.getDate() - 30)
  }

  const startDateStr = startDate.toISOString().split("T")[0]
  const endDateStr = endDate.toISOString().split("T")[0]

  // Determine multiplier and timespan based on timeframe
  let multiplier = 1
  let timespan = "day"

  if (["1m", "5m", "15m", "1H", "4H"].includes(timeframe)) {
    timespan = "minute"
    switch (timeframe) {
      case "1m":
        multiplier = 1
        break
      case "5m":
        multiplier = 5
        break
      case "15m":
        multiplier = 15
        break
      case "1H":
        multiplier = 60
        break
      case "4H":
        multiplier = 240
        break
    }
  }

  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${startDateStr}/${endDateStr}?adjusted=true&sort=asc&limit=${limit}&apikey=${POLYGON_API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Polygon HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    throw new Error("No Polygon historical data available")
  }

  return data.results.map((item: any) => ({
    timestamp: item.t,
    open: item.o,
    high: item.h,
    low: item.l,
    close: item.c,
    volume: item.v,
  }))
}

function generateMockHistoricalData(symbol: string, timeframe: string, limit = 100) {
  const data = []
  const now = Date.now()
  let interval = 24 * 60 * 60 * 1000 // 1 day default

  // Set interval based on timeframe
  switch (timeframe) {
    case "1m":
      interval = 60 * 1000
      break
    case "5m":
      interval = 5 * 60 * 1000
      break
    case "15m":
      interval = 15 * 60 * 1000
      break
    case "1H":
      interval = 60 * 60 * 1000
      break
    case "4H":
      interval = 4 * 60 * 60 * 1000
      break
    case "1D":
      interval = 24 * 60 * 60 * 1000
      break
    case "5D":
      interval = 24 * 60 * 60 * 1000
      break
    case "1M":
      interval = 24 * 60 * 60 * 1000
      break
    case "3M":
      interval = 24 * 60 * 60 * 1000
      break
    case "6M":
      interval = 24 * 60 * 60 * 1000
      break
    case "1Y":
      interval = 24 * 60 * 60 * 1000
      break
  }

  let basePrice = 100 + Math.random() * 200

  for (let i = limit; i >= 0; i--) {
    const timestamp = now - i * interval
    const volatility = 0.02 // 2% volatility
    const change = (Math.random() - 0.5) * volatility * basePrice

    const open = basePrice
    const close = basePrice + change
    const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5
    const volume = Math.floor(Math.random() * 1000000) + 100000

    data.push({
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    })

    basePrice = close // Use close as next open
  }

  return data
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const timeframe = searchParams.get("timeframe") || "1D"
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    let historicalData

    try {
      console.log(`Fetching historical data for ${symbol} (${timeframe})`)
      historicalData = await fetchHistoricalFromPolygon(symbol, timeframe, limit)
      console.log(`Successfully fetched ${historicalData.length} data points from Polygon`)
    } catch (error) {
      console.warn(`Polygon failed for ${symbol}:`, error.message)
      console.log(`Using mock historical data for ${symbol}`)
      historicalData = generateMockHistoricalData(symbol, timeframe, limit)
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      timeframe,
      data: historicalData,
    })
  } catch (error) {
    console.error("Historical data API error:", error)
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 })
  }
}
