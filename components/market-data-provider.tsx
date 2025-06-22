"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { MarketDataProvider as ProviderType } from "@/lib/market-data/market-data-service"

interface MarketDataContextType {
  provider: ProviderType
  setProvider: (provider: ProviderType) => void
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined)

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ProviderType>("iex-cloud")
  const [isConnected, setIsConnected] = useState(false)

  return (
    <MarketDataContext.Provider
      value={{
        provider,
        setProvider,
        isConnected,
        setIsConnected,
      }}
    >
      {children}
    </MarketDataContext.Provider>
  )
}

export function useMarketDataContext() {
  const context = useContext(MarketDataContext)
  if (context === undefined) {
    throw new Error("useMarketDataContext must be used within a MarketDataProvider")
  }
  return context
}
