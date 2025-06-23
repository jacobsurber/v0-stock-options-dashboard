"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, DollarSign, Activity, Plus } from "lucide-react"

interface Position {
  id: string
  symbol: string
  type: "stock" | "call" | "put"
  quantity: number
  entryPrice: number
  currentPrice: number
  strike?: number
  expiration?: string
  pnl: number
  pnlPercent: number
}

interface Trade {
  id: string
  symbol: string
  type: "stock" | "call" | "put"
  action: "buy" | "sell"
  quantity: number
  price: number
  timestamp: Date
  strike?: number
  expiration?: string
}

export function PaperTrading() {
  const [balance, setBalance] = useState(100000) // Starting with $100k
  const [positions, setPositions] = useState<Position[]>([
    {
      id: "1",
      symbol: "AAPL",
      type: "stock",
      quantity: 100,
      entryPrice: 150.0,
      currentPrice: 155.25,
      pnl: 525,
      pnlPercent: 3.5,
    },
    {
      id: "2",
      symbol: "TSLA",
      type: "call",
      quantity: 5,
      entryPrice: 12.5,
      currentPrice: 15.75,
      strike: 250,
      expiration: "2024-02-16",
      pnl: 162.5,
      pnlPercent: 26.0,
    },
  ])

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: "1",
      symbol: "AAPL",
      type: "stock",
      action: "buy",
      quantity: 100,
      price: 150.0,
      timestamp: new Date("2024-01-15T10:30:00"),
    },
    {
      id: "2",
      symbol: "TSLA",
      type: "call",
      action: "buy",
      quantity: 5,
      price: 12.5,
      strike: 250,
      expiration: "2024-02-16",
      timestamp: new Date("2024-01-16T14:15:00"),
    },
  ])

  const [orderForm, setOrderForm] = useState({
    symbol: "",
    type: "stock" as "stock" | "call" | "put",
    action: "buy" as "buy" | "sell",
    quantity: 1,
    price: 0,
    strike: 0,
    expiration: "",
  })

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)
  const totalValue = balance + positions.reduce((sum, pos) => sum + pos.currentPrice * pos.quantity, 0)

  const handlePlaceOrder = () => {
    const newTrade: Trade = {
      id: Date.now().toString(),
      symbol: orderForm.symbol.toUpperCase(),
      type: orderForm.type,
      action: orderForm.action,
      quantity: orderForm.quantity,
      price: orderForm.price,
      timestamp: new Date(),
      ...(orderForm.type !== "stock" && {
        strike: orderForm.strike,
        expiration: orderForm.expiration,
      }),
    }

    setTrades((prev) => [newTrade, ...prev])

    // Update balance
    const orderValue = orderForm.quantity * orderForm.price
    if (orderForm.action === "buy") {
      setBalance((prev) => prev - orderValue)
    } else {
      setBalance((prev) => prev + orderValue)
    }

    // Reset form
    setOrderForm({
      symbol: "",
      type: "stock",
      action: "buy",
      quantity: 1,
      price: 0,
      strike: 0,
      expiration: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Paper Trading</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Place Order</DialogTitle>
              <DialogDescription>Enter your order details for paper trading</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="AAPL"
                  value={orderForm.symbol}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, symbol: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={orderForm.type}
                    onValueChange={(value: "stock" | "call" | "put") =>
                      setOrderForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="call">Call Option</SelectItem>
                      <SelectItem value="put">Put Option</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="action">Action</Label>
                  <Select
                    value={orderForm.action}
                    onValueChange={(value: "buy" | "sell") => setOrderForm((prev) => ({ ...prev, action: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={orderForm.price}
                    onChange={(e) =>
                      setOrderForm((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>

              {orderForm.type !== "stock" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="strike">Strike Price</Label>
                    <Input
                      id="strike"
                      type="number"
                      step="0.01"
                      value={orderForm.strike}
                      onChange={(e) =>
                        setOrderForm((prev) => ({ ...prev, strike: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="expiration">Expiration</Label>
                    <Input
                      id="expiration"
                      type="date"
                      value={orderForm.expiration}
                      onChange={(e) => setOrderForm((prev) => ({ ...prev, expiration: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <Button onClick={handlePlaceOrder} className="w-full">
                Place Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Current Positions</CardTitle>
              <CardDescription>Your active paper trading positions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>P&L %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {position.type === "stock"
                            ? "Stock"
                            : position.type === "call"
                              ? `Call ${position.strike}`
                              : `Put ${position.strike}`}
                        </Badge>
                      </TableCell>
                      <TableCell>{position.quantity}</TableCell>
                      <TableCell>${position.entryPrice.toFixed(2)}</TableCell>
                      <TableCell>${position.currentPrice.toFixed(2)}</TableCell>
                      <TableCell className={position.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                        {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                      </TableCell>
                      <TableCell className={position.pnlPercent >= 0 ? "text-green-600" : "text-red-600"}>
                        {position.pnlPercent >= 0 ? "+" : ""}
                        {position.pnlPercent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>Your recent paper trading orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.timestamp.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {trade.type === "stock"
                            ? "Stock"
                            : trade.type === "call"
                              ? `Call ${trade.strike}`
                              : `Put ${trade.strike}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trade.action === "buy" ? "default" : "secondary"}>
                          {trade.action.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>${trade.price.toFixed(2)}</TableCell>
                      <TableCell>${(trade.quantity * trade.price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
