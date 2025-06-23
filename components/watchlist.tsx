import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDown, ArrowUp, Plus } from "lucide-react"
import { useBatchMarketData } from "@/hooks/use-market-data"
import { DataSourceIndicator } from "@/components/data-source-indicator"

// Replace the mock data with this:
const watchlistSymbols = ["AAPL", "TSLA", "MSFT", "GOOGL", "NVDA"]

export function Watchlist() {
  const { quotes, loading, error, lastUpdated } = useBatchMarketData(watchlistSymbols, {
    refreshInterval: 15000, // Refresh every 15 seconds
    autoRefresh: true,
  })

  if (loading && quotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading live market data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-red-600">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get data source from first quote
  const dataSource = quotes.length > 0 ? quotes[0]._metadata?.source : "mock"
  const errors = quotes.length > 0 ? quotes[0]._metadata?.errors : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Watchlist
            <DataSourceIndicator source={dataSource} lastUpdated={lastUpdated} errors={errors} />
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Symbol
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((stock) => (
              <TableRow key={stock.symbol} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{stock.symbol}</TableCell>
                <TableCell>${stock.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {stock.change > 0 ? (
                      <ArrowUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={stock.change > 0 ? "text-green-600" : "text-red-600"}>
                      ${Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell>{stock.volume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
