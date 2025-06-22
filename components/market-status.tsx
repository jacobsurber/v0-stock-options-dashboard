"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useMarketDataContext } from "./market-data-provider"

interface MarketStatus {
  isOpen: boolean
  nextOpen: string
  nextClose: string
}

export function MarketStatus() {
  const [marketStatus, setMarketStatus] = useState<MarketStatus>({
    isOpen: false,
    nextOpen: "",
    nextClose: "",
  })
  const { isConnected, provider } = useMarketDataContext()

  useEffect(() => {
    // Simple market hours check (9:30 AM - 4:00 PM ET, Mon-Fri)
    const checkMarketStatus = () => {
      const now = new Date()
      const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
      const day = et.getDay()
      const hour = et.getHours()
      const minute = et.getMinutes()
      const currentTime = hour * 60 + minute

      const marketOpen = 9 * 60 + 30 // 9:30 AM
      const marketClose = 16 * 60 // 4:00 PM

      const isWeekday = day >= 1 && day <= 5
      const isDuringMarketHours = currentTime >= marketOpen && currentTime < marketClose
      const isOpen = isWeekday && isDuringMarketHours

      setMarketStatus({
        isOpen,
        nextOpen: isOpen ? "" : "Next: 9:30 AM ET",
        nextClose: isOpen ? "4:00 PM ET" : "",
      })
    }

    checkMarketStatus()
    const interval = setInterval(checkMarketStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="text-muted-foreground">Market:</div>
      <Badge variant={marketStatus.isOpen ? "default" : "secondary"}>{marketStatus.isOpen ? "OPEN" : "CLOSED"}</Badge>
      {marketStatus.nextClose && <span className="text-muted-foreground">until {marketStatus.nextClose}</span>}
      {marketStatus.nextOpen && <span className="text-muted-foreground">{marketStatus.nextOpen}</span>}
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-xs text-muted-foreground capitalize">{provider}</span>
      </div>
    </div>
  )
}
