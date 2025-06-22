import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const optionsData = [
  {
    strike: 150,
    callBid: 12.5,
    callAsk: 12.8,
    callVolume: 245,
    putBid: 2.1,
    putAsk: 2.25,
    putVolume: 156,
  },
  {
    strike: 155,
    callBid: 8.75,
    callAsk: 9.0,
    callVolume: 189,
    putBid: 3.45,
    putAsk: 3.6,
    putVolume: 203,
  },
  {
    strike: 160,
    callBid: 5.2,
    callAsk: 5.4,
    callVolume: 312,
    putBid: 5.8,
    putAsk: 6.0,
    putVolume: 278,
  },
  {
    strike: 165,
    callBid: 2.85,
    callAsk: 3.0,
    callVolume: 156,
    putBid: 9.1,
    putAsk: 9.35,
    putVolume: 134,
  },
]

export function OptionsChain() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Options Chain - AAPL
          <Badge variant="outline">Exp: Dec 15, 2024</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center" colSpan={3}>
                CALLS
              </TableHead>
              <TableHead className="text-center">Strike</TableHead>
              <TableHead className="text-center" colSpan={3}>
                PUTS
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead>Bid</TableHead>
              <TableHead>Ask</TableHead>
              <TableHead>Vol</TableHead>
              <TableHead className="text-center">Price</TableHead>
              <TableHead>Bid</TableHead>
              <TableHead>Ask</TableHead>
              <TableHead>Vol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optionsData.map((option) => (
              <TableRow key={option.strike}>
                <TableCell className="text-green-600 font-medium">${option.callBid.toFixed(2)}</TableCell>
                <TableCell className="text-red-600 font-medium">${option.callAsk.toFixed(2)}</TableCell>
                <TableCell>{option.callVolume}</TableCell>
                <TableCell className="text-center font-bold">${option.strike}</TableCell>
                <TableCell className="text-green-600 font-medium">${option.putBid.toFixed(2)}</TableCell>
                <TableCell className="text-red-600 font-medium">${option.putAsk.toFixed(2)}</TableCell>
                <TableCell>{option.putVolume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
