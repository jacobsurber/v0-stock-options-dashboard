interface AlphaVantageQuote {
  "Global Quote": {
    "01. symbol": string
    "05. price": string
    "09. change": string
    "10. change percent": string
    "06. volume": string
    "03. high": string
    "04. low": string
    "02. open": string
    "08. previous close": string
  }
}

interface AlphaVantageTimeSeries {
  "Meta Data": {
    "1. Information": string
    "2. Symbol": string
    "3. Last Refreshed": string
    "4. Output Size": string
    "5. Time Zone": string
  }
  "Time Series (Daily)": {
    [date: string]: {
      "1. open": string
      "2. high": string
      "3. low": string
      "4. close": string
      "5. volume": string
    }
  }
}

class AlphaVantageService {
  private apiKey: string
  private baseUrl = "https://www.alphavantage.co/query"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getQuote(symbol: string): Promise<AlphaVantageQuote> {
    const response = await fetch(`${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`)

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`)
    }

    return data
  }

  async getTimeSeries(symbol: string, outputSize: "compact" | "full" = "compact"): Promise<AlphaVantageTimeSeries> {
    const response = await fetch(
      `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${this.apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`)
    }

    return data
  }

  async getIntradayData(
    symbol: string,
    interval: "1min" | "5min" | "15min" | "30min" | "60min" = "5min",
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`)
    }

    return data
  }
}

export default AlphaVantageService
