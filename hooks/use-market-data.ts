"use client"

import { useState, useEffect, useCallback } from "react"

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

interface UseMarketDataOptions {
  provider?: "mock" | "polygon" | "iex-cloud" | "alpha-vantage"
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

export function useMarketData(symbol: string, options: UseMarketDataOptions = {}): UseMarketDataReturn {
  const {
    provider = "polygon",
    refreshInterval = 30000, // 30 seconds
    autoRefresh = true,
  } = options

  const [quote, setQuote] = useState<MarketQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const fetchQuote = useCallback(async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/market-data/quote?symbol=${symbol}&provider=${provider}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quoteData = await response.json()

      if (quoteData.error) {
        throw new Error(quoteData.error)
      }

      setQuote(quoteData)
      setLastUpdated(Date.now())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch market data"
      setError(errorMessage)
      console.error("Market data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [symbol, provider])

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
  const { provider = "polygon", refreshInterval = 30000, autoRefresh = true } = options

  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const fetchQuotes = useCallback(async () => {
    if (!symbols.length) return

    setLoading(true)
    setError(null)

    try {
      const symbolsParam = symbols.join(",")
      const response = await fetch(`/api/market-data/batch?symbols=${symbolsParam}&provider=${provider}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const quotesData = await response.json()

      if (quotesData.error) {
        throw new Error(quotesData.error)
      }

      setQuotes(quotesData)
      setLastUpdated(Date.now())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch batch market data"
      setError(errorMessage)
      console.error("Batch market data fetch error:", err)

      // Fallback to mock data on error
      const mockQuotes = symbols.map((symbol) => ({
        symbol: symbol.toUpperCase(),
        price: 100 + Math.random() * 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: "1,000,000",
        high: 105 + Math.random() * 50,
        low: 95 + Math.random() * 50,
        open: 98 + Math.random() * 50,
        previousClose: 100 + Math.random() * 50,
        lastUpdated: Date.now(),
      }))
      setQuotes(mockQuotes)
      setLastUpdated(Date.now())
    } finally {
      setLoading(false)
    }
  }, [symbols, provider])

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

export function useMarketStatus() {
  const [status, setStatus] = useState<{
    isOpen: boolean
    nextOpen: string
    nextClose: string
    serverTime: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/market-data/status")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const statusData = await response.json()

      if (statusData.error) {
        throw new Error(statusData.error)
      }

      setStatus(statusData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch market status"
      setError(errorMessage)
      console.error("Market status fetch error:", err)

      // Fallback to mock status
      setStatus({
        isOpen: true,
        nextOpen: "9:30 AM EST",
        nextClose: "4:00 PM EST",
        serverTime: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()

    // Refresh every minute
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  }
}

export function useOptionsData(symbol: string, expiration?: string, options: UseMarketDataOptions = {}) {
  const { provider = "polygon" } = options

  const [optionsData, setOptionsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOptionsData = useCallback(async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      let url = `/api/market-data/options?symbol=${symbol}&provider=${provider}`
      if (expiration) {
        url += `&expiration=${expiration}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setOptionsData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch options data"
      setError(errorMessage)
      console.error("Options data fetch error:", err)

      // Fallback to mock options data
      setOptionsData({
        symbol,
        expirations: ["2024-01-19", "2024-02-16", "2024-03-15"],
        chains: {
          calls: [],
          puts: [],
        },
      })
    } finally {
      setLoading(false)
    }
  }, [symbol, expiration, provider])

  useEffect(() => {
    fetchOptionsData()
  }, [fetchOptionsData])

  return {
    optionsData,
    loading,
    error,
    refetch: fetchOptionsData,
  }
}
