import PolygonService from "./polygon"
import AlphaVantageService from "./alpha-vantage"
import IEXCloudService from "./iex-cloud"

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

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type MarketDataProvider = "polygon" | "alpha-vantage" | "iex-cloud"

class MarketDataService {
  private polygonService?: PolygonService
  private alphaVantageService?: AlphaVantageService
  private iexCloudService?: IEXCloudService
  private activeProvider: MarketDataProvider

  constructor(
    provider: MarketDataProvider = "polygon",
    apiKeys: {
      polygon?: string
      alphaVantage?: string
      iexCloud?: string
    },
  ) {
    this.activeProvider = provider

    if (apiKeys.polygon) {
      this.polygonService = new PolygonService(apiKeys.polygon)
    }

    if (apiKeys.alphaVantage) {
      this.alphaVantageService = new AlphaVantageService(apiKeys.alphaVantage)
    }

    if (apiKeys.iexCloud) {
      this.iexCloudService = new IEXCloudService(apiKeys.iexCloud)
    }
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    try {
      switch (this.activeProvider) {
        case "polygon":
          return await this.getPolygonQuote(symbol)
        case "alpha-vantage":
          return await this.getAlphaVantageQuote(symbol)
        case "iex-cloud":
          return await this.getIEXQuote(symbol)
        default:
          throw new Error(`Unsupported provider: ${this.activeProvider}`)
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error)
      throw error
    }
  }

  private async getPolygonQuote(symbol: string): Promise<MarketQuote> {
    if (!this.polygonService) {
      throw new Error("Polygon service not initialized")
    }

    const quote = await this.polygonService.getQuote(symbol)

    return {
      symbol: quote.symbol,
      price: quote.last.price,
      change: 0, // Polygon doesn't provide change directly
      changePercent: 0,
      volume: "0",
      high: 0,
      low: 0,
      open: 0,
      previousClose: 0,
      lastUpdated: quote.last.timestamp,
    }
  }

  private async getAlphaVantageQuote(symbol: string): Promise<MarketQuote> {
    if (!this.alphaVantageService) {
      throw new Error("Alpha Vantage service not initialized")
    }

    const data = await this.alphaVantageService.getQuote(symbol)
    const quote = data["Global Quote"]

    return {
      symbol: quote["01. symbol"],
      price: Number.parseFloat(quote["05. price"]),
      change: Number.parseFloat(quote["09. change"]),
      changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
      volume: quote["06. volume"],
      high: Number.parseFloat(quote["03. high"]),
      low: Number.parseFloat(quote["04. low"]),
      open: Number.parseFloat(quote["02. open"]),
      previousClose: Number.parseFloat(quote["08. previous close"]),
      lastUpdated: Date.now(),
    }
  }

  private async getIEXQuote(symbol: string): Promise<MarketQuote> {
    if (!this.iexCloudService) {
      throw new Error("IEX Cloud service not initialized")
    }

    const quote = await this.iexCloudService.getQuote(symbol)

    return {
      symbol: quote.symbol,
      price: quote.latestPrice,
      change: quote.change,
      changePercent: quote.changePercent * 100,
      volume: quote.latestVolume.toLocaleString(),
      high: quote.high,
      low: quote.low,
      open: quote.open,
      previousClose: quote.previousClose,
      marketCap: quote.marketCap,
      lastUpdated: quote.latestUpdate,
    }
  }

  async getBatchQuotes(symbols: string[]): Promise<MarketQuote[]> {
    if (this.activeProvider === "iex-cloud" && this.iexCloudService) {
      const batchData = await this.iexCloudService.getBatch(symbols, ["quote"])

      return symbols.map((symbol) => {
        const quote = batchData[symbol]?.quote
        if (!quote) {
          throw new Error(`No data for symbol: ${symbol}`)
        }

        return {
          symbol: quote.symbol,
          price: quote.latestPrice,
          change: quote.change,
          changePercent: quote.changePercent * 100,
          volume: quote.latestVolume.toLocaleString(),
          high: quote.high,
          low: quote.low,
          open: quote.open,
          previousClose: quote.previousClose,
          marketCap: quote.marketCap,
          lastUpdated: quote.latestUpdate,
        }
      })
    }

    // Fallback to individual requests for other providers
    const quotes = await Promise.all(symbols.map((symbol) => this.getQuote(symbol)))

    return quotes
  }

  async getHistoricalData(symbol: string, range = "1m"): Promise<HistoricalData[]> {
    if (this.activeProvider === "iex-cloud" && this.iexCloudService) {
      const data = await this.iexCloudService.getHistoricalPrices(symbol, range)

      return data.map((item: any) => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }))
    }

    if (this.activeProvider === "alpha-vantage" && this.alphaVantageService) {
      const data = await this.alphaVantageService.getTimeSeries(symbol)
      const timeSeries = data["Time Series (Daily)"]

      return Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: Number.parseFloat(values["1. open"]),
        high: Number.parseFloat(values["2. high"]),
        low: Number.parseFloat(values["3. low"]),
        close: Number.parseFloat(values["4. close"]),
        volume: Number.parseInt(values["5. volume"]),
      }))
    }

    throw new Error(`Historical data not supported for provider: ${this.activeProvider}`)
  }

  switchProvider(provider: MarketDataProvider) {
    this.activeProvider = provider
  }

  getActiveProvider(): MarketDataProvider {
    return this.activeProvider
  }
}

export default MarketDataService
