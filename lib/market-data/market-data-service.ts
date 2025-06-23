import type { MarketQuote } from "./market-data-service"

export type MarketDataProvider = "polygon" | "alpha-vantage" | "iex-cloud" | "mock"

export interface ApiKeys {
  polygon?: string
  alphaVantage?: string
  iexCloud?: string
}

class MarketDataService {
  private currentProvider: MarketDataProvider

  constructor(defaultProvider: MarketDataProvider = "polygon") {
    this.currentProvider = defaultProvider
    // Remove all API key initialization - will use server routes instead
  }

  switchProvider(provider: MarketDataProvider) {
    this.currentProvider = provider
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    // Use server route instead of direct API calls
    try {
      const response = await fetch(`/api/market-data/quote?symbol=${symbol}&provider=${this.currentProvider}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      return data
    } catch (error) {
      console.error(`Error fetching quote:`, error)
      return this.getMockQuote(symbol)
    }
  }

  async getBatchQuotes(symbols: string[]): Promise<MarketQuote[]> {
    // Use server route instead of direct API calls
    try {
      const symbolsParam = symbols.join(",")
      const response = await fetch(`/api/market-data/batch?symbols=${symbolsParam}&provider=${this.currentProvider}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      return data
    } catch (error) {
      console.error(`Error fetching batch quotes:`, error)
      return Promise.all(symbols.map((symbol) => this.getMockQuote(symbol)))
    }
  }

  // Keep the getMockQuote method unchanged
  private getMockQuote(symbol: string): MarketQuote {
    const basePrice = 100 + Math.random() * 200
    const change = (Math.random() - 0.5) * 10
    const changePercent = (change / basePrice) * 100

    return {
      symbol: symbol.toUpperCase(),
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000).toLocaleString(),
      high: basePrice + Math.random() * 10,
      low: basePrice - Math.random() * 10,
      open: basePrice + (Math.random() - 0.5) * 5,
      previousClose: basePrice - change,
      marketCap: Math.floor(Math.random() * 1000000000000),
      lastUpdated: Date.now(),
    }
  }
}

export default MarketDataService
