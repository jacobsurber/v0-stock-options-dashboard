"use client"

import { useState, useEffect, useCallback } from "react"
import MarketDataService, { type MarketQuote, type MarketDataProvider } from "@/lib/market-data/market-data-service"

interface UseMarketDataOptions {
  provider?: MarketDataProvider
  refreshInterval?: number
  autoRefresh?: boolean
}

interface UseMarketDataReturn {
  quote: MarketQuote | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  lastUpdated: number | null
}

// Initialize the market data service
const getMarketDataService = () => {
  return new MarketDataService("iex-cloud", {
    polygon: process.env.NEXT_PUBLIC_POLYGON_API_KEY,
    alphaVantage: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY,
    iexCloud: process.env.NEXT_PUBLIC_IEX_CLOUD_API_KEY || "pk_test_your_test_key_here",
  })
}

export function useMarketData(symbol: string, options: UseMarketDataOptions = {}): UseMarketDataReturn {
  const {
    provider = "iex-cloud",
    refreshInterval = 30000, // 30 seconds
    autoRefresh = true,
  } = options

  const [quote, setQuote] = useState<MarketQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const marketDataService = getMarketDataService()

  const fetchQuote = useCallback(async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      marketDataService.switchProvider(provider)
      const quoteData = await marketDataService.getQuote(symbol)
      setQuote(quoteData)
      setLastUpdated(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch market data")
      console.error("Market data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [symbol, provider, marketDataService])

  // Initial fetch
  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !symbol) return

    const interval = setInterval(fetchQuote, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchQuote, autoRefresh, refreshInterval, symbol])

  return {
    quote,
    loading,
    error,
    refetch: fetchQuote,
    lastUpdated,
  }
}

export function useBatchMarketData(symbols: string[], options: UseMarketDataOptions = {}) {
  const { provider = "iex-cloud", refreshInterval = 30000, autoRefresh = true } = options

  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const marketDataService = getMarketDataService()

  const fetchQuotes = useCallback(async () => {
    if (!symbols.length) return

    setLoading(true)
    setError(null)

    try {
      marketDataService.switchProvider(provider)
      const quotesData = await marketDataService.getBatchQuotes(symbols)
      setQuotes(quotesData)
      setLastUpdated(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch market data")
      console.error("Batch market data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [symbols, provider, marketDataService])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  useEffect(() => {
    if (!autoRefresh || !symbols.length) return

    const interval = setInterval(fetchQuotes, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchQuotes, autoRefresh, refreshInterval, symbols])

  return {
    quotes,
    loading,
    error,
    refetch: fetchQuotes,
    lastUpdated,
  }
}
