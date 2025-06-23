"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OptionsChain } from "@/components/options-chain"
import { Search } from "lucide-react"

export function OptionsChainPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const [expiration, setExpiration] = useState("2024-01-19")

  const expirationDates = ["2024-01-19", "2024-02-16", "2024-03-15", "2024-04-19", "2024-05-17", "2024-06-21"]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Options Chain Analysis</h2>
        <p className="text-muted-foreground">Detailed options chain data with real-time pricing and Greeks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Options Chain Lookup</CardTitle>
          <CardDescription>Search for options chains by symbol and expiration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Symbol</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter symbol (e.g., AAPL)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Expiration Date</label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expirationDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button>Update Chain</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chain" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chain">Options Chain</TabsTrigger>
          <TabsTrigger value="analysis">Greeks Analysis</TabsTrigger>
          <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="chain" className="space-y-4">
          <OptionsChain />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Greeks Analysis</CardTitle>
              <CardDescription>Risk sensitivities for the selected options chain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Greeks analysis coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volume Analysis</CardTitle>
              <CardDescription>Trading volume and open interest analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Volume analysis coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
