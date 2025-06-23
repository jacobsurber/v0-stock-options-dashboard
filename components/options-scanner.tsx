"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Volume2, Zap } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Target, TrendingDown, TrendingUp, DollarSign, AlertTriangle, BarChart3 } from "lucide-react"

interface OptionsData {
  symbol: string
  strike: number
  expiration: string
  type: "call" | "put"
  bid: number
  ask: number
  volume: number
  openInterest: number
  impliedVolatility: number
  delta: number
  gamma: number
  theta: number
  vega: number
  unusualActivity: boolean
  volumeRatio: number
}

export function OptionsScanner() {
  const [scanType, setScanType] = useState("unusual-activity")
  const [filters, setFilters] = useState({
    minVolume: 100,
    minOpenInterest: 50,
    maxDaysToExpiration: 60,
    minImpliedVolatility: 0,
    maxImpliedVolatility: 200,
  })

  const [tradingGoal, setTradingGoal] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Mock data for demonstration
  const mockOptionsData: OptionsData[] = [
    {
      symbol: "AAPL",
      strike: 180,
      expiration: "2024-02-16",
      type: "call",
      bid: 2.45,
      ask: 2.55,
      volume: 15420,
      openInterest: 8932,
      impliedVolatility: 28.5,
      delta: 0.65,
      gamma: 0.045,
      theta: -0.12,
      vega: 0.18,
      unusualActivity: true,
      volumeRatio: 8.2,
    },
    {
      symbol: "TSLA",
      strike: 250,
      expiration: "2024-02-09",
      type: "put",
      bid: 8.2,
      ask: 8.4,
      volume: 12850,
      openInterest: 5643,
      impliedVolatility: 45.2,
      delta: -0.42,
      gamma: 0.032,
      theta: -0.28,
      vega: 0.35,
      unusualActivity: true,
      volumeRatio: 12.5,
    },
    {
      symbol: "NVDA",
      strike: 600,
      expiration: "2024-03-15",
      type: "call",
      bid: 18.5,
      ask: 19.2,
      volume: 9876,
      openInterest: 12456,
      impliedVolatility: 52.8,
      delta: 0.58,
      gamma: 0.028,
      theta: -0.15,
      vega: 0.42,
      unusualActivity: false,
      volumeRatio: 3.2,
    },
    {
      symbol: "NVDA",
      strike: 580,
      expiration: "2024-03-15",
      type: "put",
      bid: 12.1,
      ask: 12.8,
      volume: 5432,
      openInterest: 8765,
      impliedVolatility: 48.3,
      delta: -0.35,
      gamma: 0.025,
      theta: -0.18,
      vega: 0.38,
      unusualActivity: false,
      volumeRatio: 2.1,
    },
    {
      symbol: "SPY",
      strike: 480,
      expiration: "2024-02-02",
      type: "call",
      bid: 1.85,
      ask: 1.95,
      volume: 25630,
      openInterest: 18945,
      impliedVolatility: 18.5,
      delta: 0.72,
      gamma: 0.055,
      theta: -0.35,
      vega: 0.08,
      unusualActivity: true,
      volumeRatio: 6.8,
    },
  ]

  const filteredData = mockOptionsData.filter((option) => {
    return (
      option.volume >= filters.minVolume &&
      option.openInterest >= filters.minOpenInterest &&
      option.impliedVolatility >= filters.minImpliedVolatility &&
      option.impliedVolatility <= filters.maxImpliedVolatility
    )
  })

  const getFilteredDataByScanType = () => {
    switch (scanType) {
      case "unusual-activity":
        return filteredData.filter((option) => option.unusualActivity)
      case "high-volume":
        return filteredData.sort((a, b) => b.volume - a.volume)
      case "high-iv":
        return filteredData.sort((a, b) => b.impliedVolatility - a.impliedVolatility)
      case "expiring-soon":
        return filteredData.filter((option) => {
          const expDate = new Date(option.expiration)
          const today = new Date()
          const daysToExp = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
          return daysToExp <= 7
        })
      default:
        return filteredData
    }
  }

  const analyzeTradeGoal = async () => {
    if (!tradingGoal.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/trading-strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-assistant-mode": "scanner",
        },
        body: JSON.stringify({
          goal: tradingGoal,
          optionChain: filteredData,
        }),
      })

      if (response.ok) {
        const analysis = await response.json()
        setAiAnalysis(analysis)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Options Scanner</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scan Type</CardTitle>
            <CardDescription>Choose what type of options to scan for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={scanType} onValueChange={setScanType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unusual-activity">Unusual Activity</SelectItem>
                <SelectItem value="high-volume">High Volume</SelectItem>
                <SelectItem value="high-iv">High Implied Volatility</SelectItem>
                <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid gap-2">
              <Label htmlFor="minVolume">Minimum Volume</Label>
              <Input
                id="minVolume"
                type="number"
                value={filters.minVolume}
                onChange={(e) => setFilters((prev) => ({ ...prev, minVolume: Number.parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minOpenInterest">Minimum Open Interest</Label>
              <Input
                id="minOpenInterest"
                type="number"
                value={filters.minOpenInterest}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minOpenInterest: Number.parseInt(e.target.value) || 0 }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
            <CardDescription>Fine-tune your options search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="maxDaysToExpiration">Max Days to Expiration</Label>
              <Input
                id="maxDaysToExpiration"
                type="number"
                value={filters.maxDaysToExpiration}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxDaysToExpiration: Number.parseInt(e.target.value) || 0 }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minImpliedVolatility">Min Implied Volatility (%)</Label>
              <Input
                id="minImpliedVolatility"
                type="number"
                value={filters.minImpliedVolatility}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minImpliedVolatility: Number.parseFloat(e.target.value) || 0 }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxImpliedVolatility">Max Implied Volatility (%)</Label>
              <Input
                id="maxImpliedVolatility"
                type="number"
                value={filters.maxImpliedVolatility}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxImpliedVolatility: Number.parseFloat(e.target.value) || 200 }))
                }
              />
            </div>

            <Button className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Run Scan
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              AI Strategy Analyzer
            </CardTitle>
            <CardDescription>
              Describe your trading goal and get AI-powered strategy recommendations based on current option chain data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tradingGoal">Trading Goal</Label>
              <Textarea
                id="tradingGoal"
                placeholder="e.g., I want a bearish vertical spread on NVDA with limited risk and high probability..."
                value={tradingGoal}
                onChange={(e) => setTradingGoal(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <BarChart3 className="h-4 w-4" />
              <span>AI will analyze {filteredData.length} available options from your current scan results</span>
            </div>

            <Button onClick={analyzeTradeGoal} disabled={!tradingGoal.trim() || isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Bot className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing Strategy...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Analyze Trading Goal
                </>
              )}
            </Button>

            {aiAnalysis && (
              <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">{aiAnalysis.strategy}</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">TRADE LEGS</h4>
                      <div className="space-y-2">
                        {aiAnalysis.legs?.map((leg: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                          >
                            <div className="flex items-center gap-2">
                              {leg.action === "BUY" ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-medium">{leg.action}</span>
                              <Badge variant={leg.type === "CALL" ? "default" : "secondary"}>{leg.type}</Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${leg.strike}</div>
                              <div className="text-xs text-gray-500">{leg.expiration}</div>
                              {leg.price && <div className="text-xs text-blue-600">${leg.price.toFixed(2)}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {aiAnalysis.breakeven && aiAnalysis.breakeven.length > 0 && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">BREAKEVEN POINTS</h4>
                        <div className="flex gap-2">
                          {aiAnalysis.breakeven.map((point: number, index: number) => (
                            <Badge key={index} variant="outline">
                              ${point.toFixed(2)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid gap-3">
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-700 dark:text-red-400">Max Loss</span>
                        </div>
                        <div className="text-xl font-bold text-red-600">{aiAnalysis.maxLoss}</div>
                      </div>

                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-700 dark:text-green-400">Max Gain</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">{aiAnalysis.maxGain}</div>
                      </div>

                      {aiAnalysis.riskReward && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-purple-700 dark:text-purple-400">Risk/Reward</span>
                          </div>
                          <div className="text-lg font-bold text-purple-600">{aiAnalysis.riskReward.ratio}</div>
                          {aiAnalysis.riskReward.probability && (
                            <div className="text-sm text-purple-500">{aiAnalysis.riskReward.probability}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Strategy Summary</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300">{aiAnalysis.summary}</p>
                  </div>

                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded border border-indigo-200 dark:border-indigo-800">
                    <h4 className="font-medium text-indigo-700 dark:text-indigo-400 mb-2">Rationale</h4>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300">{aiAnalysis.rationale}</p>
                  </div>
                </div>

                {aiAnalysis.riskWarning && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-700 dark:text-yellow-400">Risk Warning</h4>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">{aiAnalysis.riskWarning}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {scanType === "unusual-activity" && <Zap className="h-5 w-5 text-yellow-500" />}
            {scanType === "high-volume" && <Volume2 className="h-5 w-5 text-blue-500" />}
            {scanType === "high-iv" && <TrendingUp className="h-5 w-5 text-purple-500" />}
            Scan Results
          </CardTitle>
          <CardDescription>Found {getFilteredDataByScanType().length} options matching your criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Bid/Ask</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>OI</TableHead>
                <TableHead>IV</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>Alerts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredDataByScanType().map((option, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{option.symbol}</TableCell>
                  <TableCell>${option.strike}</TableCell>
                  <TableCell>
                    <Badge variant={option.type === "call" ? "default" : "secondary"}>
                      {option.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{option.expiration}</TableCell>
                  <TableCell>
                    ${option.bid.toFixed(2)} / ${option.ask.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {option.volume.toLocaleString()}
                      {option.volumeRatio > 5 && <Volume2 className="h-3 w-3 text-orange-500" />}
                    </div>
                  </TableCell>
                  <TableCell>{option.openInterest.toLocaleString()}</TableCell>
                  <TableCell>{option.impliedVolatility.toFixed(1)}%</TableCell>
                  <TableCell className={option.delta >= 0 ? "text-green-600" : "text-red-600"}>
                    {option.delta.toFixed(3)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {option.unusualActivity && (
                        <Badge variant="destructive" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Unusual
                        </Badge>
                      )}
                      {option.volumeRatio > 10 && (
                        <Badge variant="outline" className="text-xs">
                          High Vol
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
