"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, Wifi, WifiOff } from "lucide-react"

interface DataSourceIndicatorProps {
  source?: string
  lastUpdated?: number
  errors?: string[]
  className?: string
}

export function DataSourceIndicator({ source = "mock", lastUpdated, errors, className }: DataSourceIndicatorProps) {
  const getSourceInfo = () => {
    switch (source) {
      case "polygon":
        return {
          label: "Polygon.io Live",
          variant: "default" as const,
          icon: <Wifi className="h-3 w-3" />,
          color: "text-green-600",
        }
      case "alpha-vantage":
        return {
          label: "Alpha Vantage Live",
          variant: "secondary" as const,
          icon: <Wifi className="h-3 w-3" />,
          color: "text-blue-600",
        }
      case "mock":
        return {
          label: "Demo Data",
          variant: "outline" as const,
          icon: <WifiOff className="h-3 w-3" />,
          color: "text-orange-600",
        }
      default:
        return {
          label: "Unknown Source",
          variant: "destructive" as const,
          icon: <AlertTriangle className="h-3 w-3" />,
          color: "text-red-600",
        }
    }
  }

  const sourceInfo = getSourceInfo()
  const isLive = source === "polygon" || source === "alpha-vantage"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={sourceInfo.variant} className={`${className} ${sourceInfo.color}`}>
            {sourceInfo.icon}
            <span className="ml-1">{sourceInfo.label}</span>
            {isLive && <div className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">Data Source: {sourceInfo.label}</p>
            {lastUpdated && <p className="text-xs">Last Updated: {new Date(lastUpdated).toLocaleTimeString()}</p>}
            {errors && errors.length > 0 && (
              <div className="text-xs text-red-500">
                <p>API Errors:</p>
                {errors.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
            )}
            {!isLive && <p className="text-xs text-orange-500">Using demo data - check API keys in Settings</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
