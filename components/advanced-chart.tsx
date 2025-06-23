"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useMarketData } from "@/hooks/use-market-data"
import { BarChart3, TrendingUp, Settings, Maximize2, Activity } from "lucide-react"

interface ChartData {
  time: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface TechnicalIndicator {
  name: string
  value: number
  signal: "BUY" | "SELL" | "NEUTRAL"
  description: string
}

export function AdvancedChart({ symbol = "AAPL" }: { symbol?: string }) {
  const [currentSymbol, setCurrentSymbol] = useState(symbol)
  const [timeframe, setTimeframe] = useState("1D")
  const [chartType, setChartType] = useState("candlestick")
  const [indicators, setIndicators] = useState<string[]>(["SMA20", "RSI"])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { quote, loading, error } = useMarketData(currentSymbol, {
    provider: "polygon",
    refreshInterval: 15000,
    autoRefresh: true,
  })

  // Generate realistic chart data based on current quote
  useEffect(() => {
    const generateChartData = () => {
      const data: ChartData[] = []
      const basePrice = quote?.price || 157.82
      let currentPrice = basePrice

      const periods = timeframe === "1D" ? 390 : timeframe === "5D" ? 1950 : 7800 // minutes in trading periods
      const interval = timeframe === "1D" ? 1 : timeframe === "5D" ? 5 : 60

      for (let i = 0; i < periods; i += interval) {
        const volatility = 0.02
        const change = (Math.random() - 0.5) * volatility * currentPrice
        const open = currentPrice
        const close = currentPrice + change
        const high = Math.max(open, close) + Math.random() * 0.01 * currentPrice
        const low = Math.min(open, close) - Math.random() * 0.01 * currentPrice
        const volume = Math.floor(Math.random() * 1000000) + 500000

        const timestamp = Date.now() - (periods - i) * 60000

        data.push({
          time: new Date(timestamp).toISOString(),
          timestamp,
          open,
          high,
          low,
          close,
          volume,
        })

        currentPrice = close
      }

      return data
    }

    setChartData(generateChartData())
  }, [quote, timeframe, currentSymbol])

  // Calculate technical indicators
  useEffect(() => {
    if (chartData.length === 0) return

    const calculateIndicators = () => {
      const prices = chartData.map((d) => d.close)
      const indicators: TechnicalIndicator[] = []

      // RSI Calculation
      if (prices.length >= 14) {
        const rsi = calculateRSI(prices, 14)
        indicators.push({
          name: "RSI (14)",
          value: rsi,
          signal: rsi > 70 ? "SELL" : rsi < 30 ? "BUY" : "NEUTRAL",
          description: rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral",
        })
      }

      // MACD Calculation
      const macd = calculateMACD(prices)
      if (macd) {
        indicators.push({
          name: "MACD",
          value: macd.histogram,
          signal: macd.histogram > 0 ? "BUY" : "SELL",
          description: macd.histogram > 0 ? "Bullish momentum" : "Bearish momentum",
        })
      }

      // Moving Average
      if (prices.length >= 20) {
        const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20
        const currentPrice = prices[prices.length - 1]
        indicators.push({
          name: "SMA (20)",
          value: sma20,
          signal: currentPrice > sma20 ? "BUY" : "SELL",
          description: currentPrice > sma20 ? "Above MA" : "Below MA",
        })
      }

      // Bollinger Bands
      if (prices.length >= 20) {
        const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20
        const variance = prices.slice(-20).reduce((sum, price) => sum + Math.pow(price - sma20, 2), 0) / 20
        const stdDev = Math.sqrt(variance)
        const upperBand = sma20 + 2 * stdDev
        const lowerBand = sma20 - 2 * stdDev
        const currentPrice = prices[prices.length - 1]

        let signal: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL"
        let description = "Within bands"

        if (currentPrice > upperBand) {
          signal = "SELL"
          description = "Above upper band"
        } else if (currentPrice < lowerBand) {
          signal = "BUY"
          description = "Below lower band"
        }

        indicators.push({
          name: "Bollinger Bands",
          value: (currentPrice - lowerBand) / (upperBand - lowerBand),
          signal,
          description,
        })
      }

      return indicators
    }

    setTechnicalIndicators(calculateIndicators())
  }, [chartData])

  // Draw chart on canvas
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 40

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    if (chartData.length === 0) return

    // Calculate price range
    const prices = chartData.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Draw grid
    ctx.strokeStyle = "#f1f5f9"
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * (height - padding * 2)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw candlesticks or line chart
    if (chartType === "candlestick") {
      const candleWidth = Math.max(1, (width - padding * 2) / chartData.length - 1)
      chartData.forEach((data, index) => {
        const x = padding + (index * (width - padding * 2)) / chartData.length
        const openY = height - padding - ((data.open - minPrice) / priceRange) * (height - padding * 2)
        const closeY = height - padding - ((data.close - minPrice) / priceRange) * (height - padding * 2)
        const highY = height - padding - ((data.high - minPrice) / priceRange) * (height - padding * 2)
        const lowY = height - padding - ((data.low - minPrice) / priceRange) * (height - padding * 2)

        const isGreen = data.close > data.open

        // Draw wick
        ctx.strokeStyle = isGreen ? "#22c55e" : "#ef4444"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x + candleWidth / 2, highY)
        ctx.lineTo(x + candleWidth / 2, lowY)
        ctx.stroke()

        // Draw body
        ctx.fillStyle = isGreen ? "#22c55e" : "#ef4444"
        const bodyHeight = Math.abs(closeY - openY)
        const bodyY = Math.min(openY, closeY)
        ctx.fillRect(x, bodyY, candleWidth, bodyHeight || 1)
      })
    } else if (chartType === "line") {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.beginPath()
      chartData.forEach((data, index) => {
        const x = padding + (index * (width - padding * 2)) / chartData.length
        const y = height - padding - ((data.close - minPrice) / priceRange) * (height - padding * 2)
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    } else if (chartType === "area") {
      // Area chart
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.beginPath()
      chartData.forEach((data, index) => {
        const x = padding + (index * (width - padding * 2)) / chartData.length
        const y = height - padding - ((data.close - minPrice) / priceRange) * (height - padding * 2)
        if (index === 0) {
          ctx.moveTo(x, height - padding)
          ctx.lineTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.lineTo(width - padding, height - padding)
      ctx.closePath()
      ctx.fill()

      // Line on top
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.beginPath()
      chartData.forEach((data, index) => {
        const x = padding + (index * (width - padding * 2)) / chartData.length
        const y = height - padding - ((data.close - minPrice) / priceRange) * (height - padding * 2)
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }

    // Draw moving averages if enabled
    if (indicators.includes("SMA20") && chartData.length >= 20) {
      ctx.strokeStyle = "#f59e0b"
      ctx.lineWidth = 1
      ctx.beginPath()
      chartData.forEach((data, index) => {
        if (index >= 19) {
          const sma = chartData.slice(index - 19, index + 1).reduce((sum, d) => sum + d.close, 0) / 20
          const x = padding + (index * (width - padding * 2)) / chartData.length
          const y = height - padding - ((sma - minPrice) / priceRange) * (height - padding * 2)
          if (index === 19) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()
    }

    // Draw price labels
    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "right"
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i) / 5
      const y = height - padding - (i / 5) * (height - padding * 2)
      ctx.fillText(`$${price.toFixed(2)}`, padding - 5, y + 4)
    }

    // Draw time labels
    ctx.textAlign = "center"
    const timeLabels = 5
    for (let i = 0; i <= timeLabels; i++) {
      const dataIndex = Math.floor((i / timeLabels) * (chartData.length - 1))
      const data = chartData[dataIndex]
      if (data) {
        const x = padding + (dataIndex * (width - padding * 2)) / chartData.length
        const time = new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        ctx.fillText(time, x, height - 5)
      }
    }
  }, [chartData, chartType, indicators])

  const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D", "5D", "1M", "3M", "6M", "1Y"]
  const chartTypes = [
    { value: "candlestick", label: "Candlestick" },
    { value: "line", label: "Line" },
    { value: "area", label: "Area" },
    { value: "bar", label: "OHLC Bars" },
  ]

  const availableIndicators = [
    { value: "SMA20", label: "SMA (20)" },
    { value: "SMA50", label: "SMA (50)" },
    { value: "EMA12", label: "EMA (12)" },
    { value: "EMA26", label: "EMA (26)" },
    { value: "RSI", label: "RSI" },
    { value: "MACD", label: "MACD" },
    { value: "BB", label: "Bollinger Bands" },
    { value: "VOLUME", label: "Volume" },
  ]

  if (loading && !quote) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Interactive Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <div>Loading chart data...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Interactive Chart - {currentSymbol}
            </CardTitle>
            <CardDescription>Real-time price chart with technical analysis</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Symbol"
                value={currentSymbol}
                onChange={(e) => setCurrentSymbol(e.target.value.toUpperCase())}
                className="w-20"
              />
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="chart" className="space-y-4">
            {/* Price Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${quote?.price.toFixed(2)}</div>
                <div
                  className={`flex items-center gap-1 ${quote && quote.change > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  <TrendingUp className="h-4 w-4" />
                  {quote && quote.change > 0 ? "+" : ""}${quote?.change.toFixed(2)} ({quote?.changePercent.toFixed(2)}%)
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Volume: {quote?.volume}</div>
                <div>High: ${quote?.high.toFixed(2)}</div>
                <div>Low: ${quote?.low.toFixed(2)}</div>
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="relative">
              <canvas ref={canvasRef} className="w-full h-96 border rounded-lg" />
            </div>

            {/* Technical Indicators */}
            <div className="grid gap-4 md:grid-cols-4">
              {technicalIndicators.map((indicator) => (
                <div key={indicator.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{indicator.name}</span>
                    <Badge
                      variant={
                        indicator.signal === "BUY"
                          ? "default"
                          : indicator.signal === "SELL"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {indicator.signal}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold">{indicator.value.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{indicator.description}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="indicators" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {availableIndicators.map((indicator) => (
                <Button
                  key={indicator.value}
                  size="sm"
                  variant={indicators.includes(indicator.value) ? "default" : "outline"}
                  onClick={() => {
                    setIndicators((prev) =>
                      prev.includes(indicator.value)
                        ? prev.filter((i) => i !== indicator.value)
                        : [...prev, indicator.value],
                    )
                  }}
                  className="justify-start"
                >
                  {indicator.label}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Symbol</label>
                <Input
                  value={currentSymbol}
                  onChange={(e) => setCurrentSymbol(e.target.value.toUpperCase())}
                  placeholder="Enter symbol (e.g., AAPL)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Chart Style</label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Default Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((tf) => (
                      <SelectItem key={tf} value={tf}>
                        {tf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Technical indicator calculations
function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50

  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1]
    if (change > 0) gains += change
    else losses -= change
  }

  const avgGain = gains / period
  const avgLoss = losses / period

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } | null {
  if (prices.length < 26) return null

  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  const macd = ema12 - ema26
  const signal = 0 // Simplified
  const histogram = macd - signal

  return { macd, signal, histogram }
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1]

  const multiplier = 2 / (period + 1)
  let ema = prices.slice(-period).reduce((a, b) => a + b, 0) / period

  for (let i = prices.length - period + 1; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }

  return ema
}
