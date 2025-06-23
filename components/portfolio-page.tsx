"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { Positions } from "@/components/positions"
import { TrendingUp, TrendingDown, Percent } from "lucide-react"

export function PortfolioPage() {
  const performanceMetrics = [
    { label: "Total Return", value: "+$12,450", change: "+8.2%", trend: "up" },
    { label: "Day P&L", value: "+$1,234", change: "+2.1%", trend: "up" },
    { label: "Options P&L", value: "-$567", change: "-1.2%", trend: "down" },
    { label: "Win Rate", value: "68%", change: "+2.3%", trend: "up" },
  ]

  const riskMetrics = [
    { label: "Portfolio Beta", value: "1.15" },
    { label: "Max Drawdown", value: "-8.5%" },
    { label: "Sharpe Ratio", value: "1.42" },
    { label: "VaR (95%)", value: "-$2,340" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Portfolio Management</h2>
        <p className="text-muted-foreground">Comprehensive view of your trading portfolio and performance metrics</p>
      </div>

      <PortfolioOverview />

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {metric.change} from last period
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {riskMetrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Positions />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>Recent trading activity and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Trade history coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
