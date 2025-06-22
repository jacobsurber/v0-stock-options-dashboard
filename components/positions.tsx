import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const positionsData = [
  {
    symbol: "AAPL",
    type: "Call",
    strike: 160,
    expiry: "Dec 15",
    quantity: 5,
    avgCost: 8.5,
    currentPrice: 9.25,
    pnl: 375,
    pnlPercent: 8.82,
  },
  {
    symbol: "TSLA",
    type: "Put",
    strike: 250,
    expiry: "Dec 22",
    quantity: -3,
    avgCost: 12.75,
    currentPrice: 15.2,
    pnl: -735,
    pnlPercent: -19.22,
  },
  {
    symbol: "MSFT",
    type: "Call",
    strike: 340,
    expiry: "Jan 19",
    quantity: 2,
    avgCost: 15.3,
    currentPrice: 18.75,
    pnl: 690,
    pnlPercent: 22.55,
  },
]

export function Positions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Strike/Exp</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Avg Cost</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positionsData.map((position, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{position.symbol}</TableCell>
                <TableCell>
                  <Badge variant={position.type === "Call" ? "default" : "secondary"}>{position.type}</Badge>
                </TableCell>
                <TableCell>
                  ${position.strike} / {position.expiry}
                </TableCell>
                <TableCell className={position.quantity > 0 ? "text-green-600" : "text-red-600"}>
                  {position.quantity > 0 ? "+" : ""}
                  {position.quantity}
                </TableCell>
                <TableCell>${position.avgCost.toFixed(2)}</TableCell>
                <TableCell>${position.currentPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <div className={position.pnl > 0 ? "text-green-600" : "text-red-600"}>
                    ${position.pnl > 0 ? "+" : ""}
                    {position.pnl.toFixed(0)}
                    <div className="text-xs">
                      ({position.pnl > 0 ? "+" : ""}
                      {position.pnlPercent.toFixed(1)}%)
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Close
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
