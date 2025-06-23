"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, TrendingDown } from "lucide-react"

// Black-Scholes calculation functions
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)))
}

function erf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}

function blackScholes(
  S: number, // Current stock price
  K: number, // Strike price
  T: number, // Time to expiration (in years)
  r: number, // Risk-free rate
  sigma: number, // Volatility
  optionType: "call" | "put",
): { price: number; delta: number; gamma: number; theta: number; vega: number; rho: number } {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)

  const Nd1 = normalCDF(d1)
  const Nd2 = normalCDF(d2)
  const nd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI)

  let price: number
  let delta: number
  let rho: number

  if (optionType === "call") {
    price = S * Nd1 - K * Math.exp(-r * T) * Nd2
    delta = Nd1
    rho = (K * T * Math.exp(-r * T) * Nd2) / 100
  } else {
    price = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1)
    delta = Nd1 - 1
    rho = (-K * T * Math.exp(-r * T) * normalCDF(-d2)) / 100
  }

  const gamma = nd1 / (S * sigma * Math.sqrt(T))
  const theta =
    ((-S * nd1 * sigma) / (2 * Math.sqrt(T)) -
      r * K * Math.exp(-r * T) * (optionType === "call" ? Nd2 : normalCDF(-d2))) /
    365
  const vega = (S * nd1 * Math.sqrt(T)) / 100

  return { price, delta, gamma, theta, vega, rho }
}

export function OptionsCalculator() {
  const [inputs, setInputs] = useState({
    stockPrice: 100,
    strikePrice: 100,
    daysToExpiration: 30,
    volatility: 25,
    riskFreeRate: 5,
    optionType: "call" as "call" | "put",
  })

  const timeToExpiration = inputs.daysToExpiration / 365
  const volatilityDecimal = inputs.volatility / 100
  const riskFreeRateDecimal = inputs.riskFreeRate / 100

  const results = blackScholes(
    inputs.stockPrice,
    inputs.strikePrice,
    timeToExpiration,
    riskFreeRateDecimal,
    volatilityDecimal,
    inputs.optionType,
  )

  const handleInputChange = (field: string, value: string | number) => {
    setInputs((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Options Calculator</h2>
      </div>

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator">Black-Scholes Calculator</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit/Loss Diagram</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Input Parameters</CardTitle>
                <CardDescription>Enter the option parameters for calculation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="optionType">Option Type</Label>
                  <Select
                    value={inputs.optionType}
                    onValueChange={(value: "call" | "put") => handleInputChange("optionType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call Option</SelectItem>
                      <SelectItem value="put">Put Option</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stockPrice">Current Stock Price ($)</Label>
                  <Input
                    id="stockPrice"
                    type="number"
                    value={inputs.stockPrice}
                    onChange={(e) => handleInputChange("stockPrice", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="strikePrice">Strike Price ($)</Label>
                  <Input
                    id="strikePrice"
                    type="number"
                    value={inputs.strikePrice}
                    onChange={(e) => handleInputChange("strikePrice", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="daysToExpiration">Days to Expiration</Label>
                  <Input
                    id="daysToExpiration"
                    type="number"
                    value={inputs.daysToExpiration}
                    onChange={(e) => handleInputChange("daysToExpiration", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="volatility">Implied Volatility (%)</Label>
                  <Input
                    id="volatility"
                    type="number"
                    value={inputs.volatility}
                    onChange={(e) => handleInputChange("volatility", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="riskFreeRate">Risk-Free Rate (%)</Label>
                  <Input
                    id="riskFreeRate"
                    type="number"
                    value={inputs.riskFreeRate}
                    onChange={(e) => handleInputChange("riskFreeRate", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculated Results</CardTitle>
                <CardDescription>Black-Scholes pricing and Greeks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Option Price</span>
                    <Badge variant="secondary" className="text-lg">
                      ${results.price.toFixed(2)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">The Greeks</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Delta</span>
                        <span className={results.delta >= 0 ? "text-green-600" : "text-red-600"}>
                          {results.delta.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gamma</span>
                        <span>{results.gamma.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Theta</span>
                        <span className="text-red-600">{results.theta.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vega</span>
                        <span>{results.vega.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rho</span>
                        <span>{results.rho.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Moneyness</h4>
                    <div className="flex items-center gap-2">
                      {inputs.stockPrice > inputs.strikePrice ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">
                            {inputs.optionType === "call" ? "In-the-Money" : "Out-of-the-Money"}
                          </span>
                        </>
                      ) : inputs.stockPrice < inputs.strikePrice ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="text-red-600">
                            {inputs.optionType === "call" ? "Out-of-the-Money" : "In-the-Money"}
                          </span>
                        </>
                      ) : (
                        <span className="text-yellow-600">At-the-Money</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit-loss">
          <Card>
            <CardHeader>
              <CardTitle>Profit/Loss Diagram</CardTitle>
              <CardDescription>Visual representation of option payoff at expiration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Interactive P&L chart coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
