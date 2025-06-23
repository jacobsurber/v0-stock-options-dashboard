"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, BarChart3 } from "lucide-react"

interface OptionLeg {
  id: string
  type: "call" | "put"
  action: "buy" | "sell"
  strike: number
  expiration: string
  quantity: number
  premium: number
}

interface Strategy {
  id: string
  name: string
  legs: OptionLeg[]
  maxProfit: number
  maxLoss: number
  breakeven: number[]
  riskReward: number
}

export function StrategyAnalyzer() {
  const [currentStrategy, setCurrentStrategy] = useState<OptionLeg[]>([])
  const [newLeg, setNewLeg] = useState<Partial<OptionLeg>>({
    type: "call",
    action: "buy",
    strike: 0,
    expiration: "",
    quantity: 1,
    premium: 0,
  })

  const [savedStrategies] = useState<Strategy[]>([
    {
      id: "1",
      name: "Bull Call Spread",
      legs: [
        { id: "1", type: "call", action: "buy", strike: 150, expiration: "2024-02-16", quantity: 1, premium: 5.5 },
        { id: "2", type: "call", action: "sell", strike: 160, expiration: "2024-02-16", quantity: 1, premium: 2.25 },
      ],
      maxProfit: 675,
      maxLoss: 325,
      breakeven: [153.25],
      riskReward: 2.08,
    },
    {
      id: "2",
      name: "Iron Condor",
      legs: [
        { id: "1", type: "put", action: "sell", strike: 140, expiration: "2024-02-16", quantity: 1, premium: 1.5 },
        { id: "2", type: "put", action: "buy", strike: 135, expiration: "2024-02-16", quantity: 1, premium: 0.75 },
        { id: "3", type: "call", action: "sell", strike: 160, expiration: "2024-02-16", quantity: 1, premium: 1.25 },
        { id: "4", type: "call", action: "buy", strike: 165, expiration: "2024-02-16", quantity: 1, premium: 0.5 },
      ],
      maxProfit: 150,
      maxLoss: 350,
      breakeven: [141.5, 158.5],
      riskReward: 0.43,
    },
  ])

  const addLeg = () => {
    if (newLeg.strike && newLeg.expiration && newLeg.premium) {
      const leg: OptionLeg = {
        id: Date.now().toString(),
        type: newLeg.type!,
        action: newLeg.action!,
        strike: newLeg.strike,
        expiration: newLeg.expiration,
        quantity: newLeg.quantity || 1,
        premium: newLeg.premium,
      }
      setCurrentStrategy([...currentStrategy, leg])
      setNewLeg({
        type: "call",
        action: "buy",
        strike: 0,
        expiration: "",
        quantity: 1,
        premium: 0,
      })
    }
  }

  const removeLeg = (id: string) => {
    setCurrentStrategy(currentStrategy.filter((leg) => leg.id !== id))
  }

  const calculateStrategy = () => {
    if (currentStrategy.length === 0) return null

    let totalCost = 0
    currentStrategy.forEach((leg) => {
      const cost = leg.premium * leg.quantity * 100
      totalCost += leg.action === "buy" ? cost : -cost
    })

    return {
      totalCost: Math.abs(totalCost),
      netDebit: totalCost > 0,
      legs: currentStrategy.length,
    }
  }

  const strategyTemplates = [
    { name: "Bull Call Spread", description: "Bullish strategy with limited risk and reward" },
    { name: "Bear Put Spread", description: "Bearish strategy with limited risk and reward" },
    { name: "Iron Condor", description: "Neutral strategy profiting from low volatility" },
    { name: "Straddle", description: "Volatility play expecting large price movement" },
    { name: "Strangle", description: "Volatility play with wider profit range" },
    { name: "Butterfly", description: "Neutral strategy with high probability of profit" },
  ]

  const analysis = calculateStrategy()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Strategy Analyzer</h2>
          <p className="text-muted-foreground">Build and analyze multi-leg options strategies</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          {currentStrategy.length} Legs
        </Badge>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Strategy Builder</TabsTrigger>
          <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="saved">Saved Strategies</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Option Leg</CardTitle>
                <CardDescription>Configure each leg of your options strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Option Type</Label>
                    <Select
                      value={newLeg.type}
                      onValueChange={(value: "call" | "put") => setNewLeg({ ...newLeg, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="put">Put</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select
                      value={newLeg.action}
                      onValueChange={(value: "buy" | "sell") => setNewLeg({ ...newLeg, action: value })}
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
                  <div className="space-y-2">
                    <Label>Strike Price</Label>
                    <Input
                      type="number"
                      placeholder="150.00"
                      value={newLeg.strike || ""}
                      onChange={(e) => setNewLeg({ ...newLeg, strike: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Premium</Label>
                    <Input
                      type="number"
                      placeholder="5.50"
                      step="0.01"
                      value={newLeg.premium || ""}
                      onChange={(e) => setNewLeg({ ...newLeg, premium: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiration</Label>
                    <Input
                      type="date"
                      value={newLeg.expiration}
                      onChange={(e) => setNewLeg({ ...newLeg, expiration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={newLeg.quantity || ""}
                      onChange={(e) => setNewLeg({ ...newLeg, quantity: Number.parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <Button onClick={addLeg} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Leg
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Strategy</CardTitle>
                <CardDescription>Review your strategy legs</CardDescription>
              </CardHeader>
              <CardContent>
                {currentStrategy.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No legs added yet. Add your first option leg to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentStrategy.map((leg) => (
                      <div key={leg.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={leg.action === "buy" ? "default" : "secondary"}>
                            {leg.action.toUpperCase()}
                          </Badge>
                          <div>
                            <div className="font-medium">
                              {leg.type.toUpperCase()} ${leg.strike}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {leg.expiration} • {leg.quantity}x • ${leg.premium}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeLeg(leg.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {analysis ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analysis.totalCost.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{analysis.netDebit ? "Net Debit" : "Net Credit"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Strategy Legs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.legs}</div>
                  <p className="text-xs text-muted-foreground">Option contracts</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Complexity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.legs <= 2 ? "Simple" : analysis.legs <= 4 ? "Complex" : "Advanced"}
                  </div>
                  <p className="text-xs text-muted-foreground">Strategy type</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Strategy to Analyze</h3>
                <p className="text-muted-foreground">Add option legs to see risk analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <div className="space-y-4">
            {savedStrategies.map((strategy) => (
              <Card key={strategy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{strategy.name}</CardTitle>
                    <Badge variant="outline">{strategy.legs.length} Legs</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Max Profit</div>
                      <div className="font-medium text-green-600">${strategy.maxProfit.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Max Loss</div>
                      <div className="font-medium text-red-600">${strategy.maxLoss.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Risk/Reward</div>
                      <div className="font-medium">{strategy.riskReward.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Breakeven</div>
                      <div className="font-medium">{strategy.breakeven.map((be) => `$${be}`).join(", ")}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {strategy.legs.map((leg, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant={leg.action === "buy" ? "default" : "secondary"} className="text-xs">
                          {leg.action.toUpperCase()}
                        </Badge>
                        <span>
                          {leg.type.toUpperCase()} ${leg.strike}
                        </span>
                        <span className="text-muted-foreground">• ${leg.premium}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strategyTemplates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:bg-accent">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Load Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
