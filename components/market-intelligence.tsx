"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, ExternalLink, Search } from "lucide-react"

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: Date
  sentiment: "positive" | "negative" | "neutral"
  symbols: string[]
}

interface EarningsEvent {
  id: string
  symbol: string
  company: string
  date: Date
  time: "BMO" | "AMC" | "TBD"
  estimate: number
  actual?: number
  surprise?: number
}

interface EconomicEvent {
  id: string
  title: string
  date: Date
  importance: "high" | "medium" | "low"
  forecast?: string
  previous?: string
  actual?: string
}

export function MarketIntelligence() {
  const [searchTerm, setSearchTerm] = useState("")

  const newsItems: NewsItem[] = [
    {
      id: "1",
      title: "Federal Reserve Signals Potential Rate Changes",
      summary:
        "The Federal Reserve indicated possible adjustments to interest rates in response to recent economic data.",
      source: "Reuters",
      publishedAt: new Date("2024-01-15T10:30:00"),
      sentiment: "neutral",
      symbols: ["SPY", "QQQ"],
    },
    {
      id: "2",
      title: "Tech Stocks Rally on AI Optimism",
      summary:
        "Major technology companies see significant gains as investors remain bullish on artificial intelligence prospects.",
      source: "Bloomberg",
      publishedAt: new Date("2024-01-15T09:15:00"),
      sentiment: "positive",
      symbols: ["AAPL", "MSFT", "GOOGL", "NVDA"],
    },
    {
      id: "3",
      title: "Energy Sector Faces Headwinds",
      summary: "Oil prices decline amid concerns about global demand and increased production capacity.",
      source: "CNBC",
      publishedAt: new Date("2024-01-15T08:45:00"),
      sentiment: "negative",
      symbols: ["XOM", "CVX", "COP"],
    },
  ]

  const earningsEvents: EarningsEvent[] = [
    {
      id: "1",
      symbol: "AAPL",
      company: "Apple Inc.",
      date: new Date("2024-01-16"),
      time: "AMC",
      estimate: 2.18,
      actual: 2.25,
      surprise: 3.2,
    },
    {
      id: "2",
      symbol: "MSFT",
      company: "Microsoft Corporation",
      date: new Date("2024-01-17"),
      time: "AMC",
      estimate: 2.78,
    },
    {
      id: "3",
      symbol: "GOOGL",
      company: "Alphabet Inc.",
      date: new Date("2024-01-18"),
      time: "AMC",
      estimate: 1.45,
    },
  ]

  const economicEvents: EconomicEvent[] = [
    {
      id: "1",
      title: "Consumer Price Index (CPI)",
      date: new Date("2024-01-16T08:30:00"),
      importance: "high",
      forecast: "3.2%",
      previous: "3.1%",
    },
    {
      id: "2",
      title: "Federal Open Market Committee Meeting",
      date: new Date("2024-01-17T14:00:00"),
      importance: "high",
      forecast: "No Change Expected",
    },
    {
      id: "3",
      title: "Initial Jobless Claims",
      date: new Date("2024-01-18T08:30:00"),
      importance: "medium",
      forecast: "220K",
      previous: "218K",
    },
  ]

  const getSentimentBadge = (sentiment: NewsItem["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-green-100 text-green-800">Positive</Badge>
      case "negative":
        return <Badge className="bg-red-100 text-red-800">Negative</Badge>
      case "neutral":
        return <Badge variant="secondary">Neutral</Badge>
    }
  }

  const getImportanceBadge = (importance: EconomicEvent["importance"]) => {
    switch (importance) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
    }
  }

  const filteredNews = newsItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbols.some((symbol) => symbol.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Market Intelligence</h2>
          <p className="text-muted-foreground">Stay informed with news, earnings, and economic events</p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news or symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Tabs defaultValue="news" className="space-y-4">
        <TabsList>
          <TabsTrigger value="news">Market News</TabsTrigger>
          <TabsTrigger value="earnings">Earnings Calendar</TabsTrigger>
          <TabsTrigger value="economic">Economic Events</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{item.source}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{item.publishedAt.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSentimentBadge(item.sentiment)}
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{item.summary}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Related:</span>
                    {item.symbols.map((symbol) => (
                      <Badge key={symbol} variant="outline">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <div className="space-y-4">
            {earningsEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium text-lg">{event.symbol}</div>
                        <div className="text-sm text-muted-foreground">{event.company}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{event.date.toLocaleDateString()}</div>
                        <Badge variant="outline">{event.time}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Estimate</div>
                          <div className="font-medium">${event.estimate}</div>
                        </div>
                        {event.actual && (
                          <div>
                            <div className="text-muted-foreground">Actual</div>
                            <div className="font-medium">${event.actual}</div>
                          </div>
                        )}
                        {event.surprise && (
                          <div>
                            <div className="text-muted-foreground">Surprise</div>
                            <div className={`font-medium ${event.surprise > 0 ? "text-green-600" : "text-red-600"}`}>
                              {event.surprise > 0 ? "+" : ""}
                              {event.surprise}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="economic" className="space-y-4">
          <div className="space-y-4">
            {economicEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getImportanceBadge(event.importance)}
                      <div className="text-right text-sm">
                        {event.forecast && (
                          <div>
                            <span className="text-muted-foreground">Forecast: </span>
                            <span className="font-medium">{event.forecast}</span>
                          </div>
                        )}
                        {event.previous && (
                          <div>
                            <span className="text-muted-foreground">Previous: </span>
                            <span className="font-medium">{event.previous}</span>
                          </div>
                        )}
                        {event.actual && (
                          <div>
                            <span className="text-muted-foreground">Actual: </span>
                            <span className="font-medium">{event.actual}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
