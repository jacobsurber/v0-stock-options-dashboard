import PolygonService from "./polygon"
import AlphaVantageService from "./alpha-vantage"
import IEXCloudService from "./iex-cloud"

export type MarketDataProvider = "polygon" | "alpha-vantage" | "iex-cloud" | "mock"

export interface MarketQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: string
  high: number
  low: number
  open: number
  previousClose: number
  marketCap?: number
  lastUpdated: number
}

export interface ApiKeys {
  polygon?: string
  alphaVantage?: string
  iexCloud?: string
}

class MarketDataService {
  private currentProvider: MarketDataProvider
  private services: Map<MarketDataProvider, any> = new Map()

  constructor(defaultProvider: MarketDataProvider = "polygon", apiKeys: ApiKeys = {}) {
    this.currentProvider = defaultProvider

    // Initialize services with API keys from environment or passed keys
    const polygonKey = apiKeys.polygon || process.env.NEXT_PUBLIC_POLYGON_API_KEY
    const alphaVantageKey = apiKeys.alphaVantage || process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
    const iexCloudKey = apiKeys.iexCloud || process.env.NEXT_PUBLIC_IEX_CLOUD_API_KEY

    if (polygonKey) {
      this.services.set("polygon", new PolygonService(polygonKey))
    }

    if (alphaVantageKey) {
      this.services.set("alpha-vantage", new AlphaVantageService(alphaVantageKey))
    }

    if (iexCloudKey) {
      this.services.set("iex-cloud", new IEXCloudService(iexCloudKey))
    }
  }

  switchProvider(provider: MarketDataProvider) {
    this.currentProvider = provider
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    if (this.currentProvider === "mock") {
      return this.getMockQuote(symbol)
    }

    const service = this.services.get(this.currentProvider)
    if (!service) {
      console.warn(`No service available for ${this.currentProvider}, falling back to mock data`)
      return this.getMockQuote(symbol)
    }

    try {
      const rawQuote = await service.getQuote(symbol)
      return this.normalizeQuote(rawQuote, this.currentProvider)
    } catch (error) {
      console.error(`Error fetching quote from ${this.currentProvider}:`, error)
      return this.getMockQuote(symbol)
    }
  }

  async getBatchQuotes(symbols: string[]): Promise<MarketQuote[]> {
    if (this.currentProvider === "mock") {
      return Promise.all(symbols.map((symbol) => this.getMockQuote(symbol)))
    }

    const service = this.services.get(this.currentProvider)
    if (!service) {
      console.warn(`No service available for ${this.currentProvider}, falling back to mock data`)
      return Promise.all(symbols.map((symbol) => this.getMockQuote(symbol)))
    }

    try {
      // For now, fetch quotes individually
      // In production, you'd use batch endpoints where available
      const quotes = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const rawQuote = await service.getQuote(symbol)
            return this.normalizeQuote(rawQuote, this.currentProvider)
          } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error)
            return this.getMockQuote(symbol)
          }
        }),
      )
      return quotes
    } catch (error) {
      console.error(`Error fetching batch quotes from ${this.currentProvider}:`, error)
      return Promise.all(symbols.map((symbol) => this.getMockQuote(symbol)))
    }
  }

  private normalizeQuote(rawQuote: any, provider: MarketDataProvider): MarketQuote {
    switch (provider) {
      case "polygon":
        return {
          symbol: rawQuote.symbol || "UNKNOWN",
          price: rawQuote.last?.price || 0,
          change: 0, // Calculate from previous close if available
          changePercent: 0,
          volume: "0",
          high: 0,
          low: 0,
          open: 0,
          previousClose: 0,
          lastUpdated: Date.now(),
        }

      case "alpha-vantage":
        const quote = rawQuote["Global Quote"] || {}
        return {
          symbol: quote["01. symbol"] || "UNKNOWN",
          price: Number.parseFloat(quote["05. price"] || "0"),
          change: Number.parseFloat(quote["09. change"] || "0"),
          changePercent: Number.parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
          volume: quote["06. volume"] || "0",
          high: Number.parseFloat(quote["03. high"] || "0"),
          low: Number.parseFloat(quote["04. low"] || "0"),
          open: Number.parseFloat(quote["02. open"] || "0"),
          previousClose: Number.parseFloat(quote["08. previous close"] || "0"),
          lastUpdated: Date.now(),
        }

      case "iex-cloud":
        return {
          symbol: rawQuote.symbol || "UNKNOWN",
          price: rawQuote.latestPrice || 0,
          change: rawQuote.change || 0,
          changePercent: rawQuote.changePercent ? rawQuote.changePercent * 100 : 0,
          volume: rawQuote.latestVolume?.toString() || "0",
          high: rawQuote.high || 0,
          low: rawQuote.low || 0,
          open: rawQuote.open || 0,
          previousClose: rawQuote.previousClose || 0,
          marketCap: rawQuote.marketCap,
          lastUpdated: Date.now(),
        }

      default:
        return this.getMockQuote(rawQuote.symbol || "UNKNOWN")
    }
  }

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
