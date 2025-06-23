"use client"

import { AdvancedChart } from "@/components/advanced-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ChartsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Charts & Technical Analysis</h2>
        <p className="text-muted-foreground">Advanced charting with technical indicators and real-time data</p>
      </div>

      <Tabs defaultValue="advanced" className="space-y-4">
        <TabsList>
          <TabsTrigger value="advanced">Advanced Chart</TabsTrigger>
          <TabsTrigger value="comparison">Symbol Comparison</TabsTrigger>
          <TabsTrigger value="screener">Technical Screener</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="space-y-4">
          <AdvancedChart />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Symbol Comparison</CardTitle>
              <CardDescription>Compare multiple symbols side by side</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Symbol comparison coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screener" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Screener</CardTitle>
              <CardDescription>Screen stocks based on technical indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Technical screener coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
