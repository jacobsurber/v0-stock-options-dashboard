interface IEXQuote {
  symbol: string
  companyName: string
  primaryExchange: string
  calculationPrice: string
  open: number
  openTime: number
  openSource: string
  close: number
  closeTime: number
  closeSource: string
  high: number
  highTime: number
  highSource: string
  low: number
  lowTime: number
  lowSource: string
  latestPrice: number
  latestSource: string
  latestTime: string
  latestUpdate: number
  latestVolume: number
  iexRealtimePrice: number
  iexRealtimeSize: number
  iexLastUpdated: number
  delayedPrice: number
  delayedPriceTime: number
  oddLotDelayedPrice: number
  oddLotDelayedPriceTime: number
  extendedPrice: number
  extendedChange: number
  extendedChangePercent: number
  extendedPriceTime: number
  previousClose: number
  previousVolume: number
  change: number
  changePercent: number
  volume: number
  iexMarketPercent: number
  iexVolume: number
  avgTotalVolume: number
  iexBidPrice: number
  iexBidSize: number
  iexAskPrice: number
  iexAskSize: number
  iexOpen: number
  iexOpenTime: number
  iexClose: number
  iexCloseTime: number
  marketCap: number
  peRatio: number
  week52High: number
  week52Low: number
  ytdChange: number
  lastTradeTime: number
  isUSMarketOpen: boolean
}

class IEXCloudService {
  private apiKey: string
  private baseUrl: string
  private version: string

  constructor(apiKey: string, sandbox = false) {
    this.apiKey = apiKey
    this.version = "v1"
    this.baseUrl = sandbox ? "https://sandbox.iexapis.com" : "https://cloud.iexapis.com"
  }

  async getQuote(symbol: string): Promise<IEXQuote> {
    const response = await fetch(`${this.baseUrl}/${this.version}/stock/${symbol}/quote?token=${this.apiKey}`)

    if (!response.ok) {
      throw new Error(`IEX Cloud API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getBatch(symbols: string[], types: string[] = ["quote"]): Promise<any> {
    const symbolsStr = symbols.join(",")
    const typesStr = types.join(",")

    const response = await fetch(
      `${this.baseUrl}/${this.version}/stock/market/batch?symbols=${symbolsStr}&types=${typesStr}&token=${this.apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`IEX Cloud API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getHistoricalPrices(symbol: string, range = "1m"): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${this.version}/stock/${symbol}/chart/${range}?token=${this.apiKey}`)

    if (!response.ok) {
      throw new Error(`IEX Cloud API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getMarketStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${this.version}/market?token=${this.apiKey}`)

    if (!response.ok) {
      throw new Error(`IEX Cloud API error: ${response.statusText}`)
    }

    return response.json()
  }
}

export default IEXCloudService
