"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMarketData } from "@/hooks/use-market-data"

export function PriceChart() {
  const { quote, loading, error, lastUpdated } = useMarketData("AAPL", {
    refreshInterval: 15000,
    autoRefresh: true,
  })

  if (loading && !quote) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AAPL Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-lg font-semibold mb-2">Loading...</div>
              <div className="text-sm">Fetching real-time data</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AAPL Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center text-red-600">
              <div className="text-lg font-semibold mb-2">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {quote?.symbol} Price Chart
          <div className="flex gap-2">
            <Badge variant="outline">1D</Badge>
            <Badge>5D</Badge>
            <Badge variant="outline">1M</Badge>
            <Badge variant="outline">3M</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-lg font-semibold mb-2">${quote?.price.toFixed(2)}</div>
            <div className={`text-sm mb-2 ${quote && quote.change > 0 ? "text-green-600" : "text-red-600"}`}>
              {quote && quote.change > 0 ? "+" : ""}${quote?.change.toFixed(2)} ({quote?.changePercent.toFixed(2)}%)
            </div>
            <div className="text-xs">Live Market Data</div>
            {lastUpdated && (
              <div className="text-xs mt-1">Last updated: {new Date(lastUpdated).toLocaleTimeString()}</div>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Open</div>
            <div className="font-medium">${quote?.open.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">High</div>
            <div className="font-medium">${quote?.high.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Low</div>
            <div className="font-medium">${quote?.low.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Volume</div>
            <div className="font-medium">{quote?.volume}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
