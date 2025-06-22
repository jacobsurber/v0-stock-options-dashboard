interface PolygonQuote {
  symbol: string
  last: {
    price: number
    size: number
    exchange: number
    timeframe: string
    timestamp: number
  }
  market_status: string
  fmv: number
}

interface PolygonAggregates {
  ticker: string
  queryCount: number
  resultsCount: number
  adjusted: boolean
  results: Array<{
    c: number // close
    h: number // high
    l: number // low
    o: number // open
    t: number // timestamp
    v: number // volume
    vw: number // volume weighted average price
  }>
}

class PolygonService {
  private apiKey: string
  private baseUrl = "https://api.polygon.io"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getQuote(symbol: string): Promise<PolygonQuote> {
    const response = await fetch(`${this.baseUrl}/v2/last/nbbo/${symbol}?apikey=${this.apiKey}`)

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.results
  }

  async getAggregates(
    symbol: string,
    multiplier = 1,
    timespan = "day",
    from: string,
    to: string,
  ): Promise<PolygonAggregates> {
    const response = await fetch(
      `${this.baseUrl}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&apikey=${this.apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getMarketStatus(): Promise<{ market: string; serverTime: string; exchanges: any }> {
    const response = await fetch(`${this.baseUrl}/v1/marketstatus/now?apikey=${this.apiKey}`)

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getOptionsChain(symbol: string, expiration?: string): Promise<any> {
    let url = `${this.baseUrl}/v3/reference/options/contracts?underlying_ticker=${symbol}&limit=1000&apikey=${this.apiKey}`

    if (expiration) {
      url += `&expiration_date=${expiration}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`)
    }

    return response.json()
  }
}

export default PolygonService
