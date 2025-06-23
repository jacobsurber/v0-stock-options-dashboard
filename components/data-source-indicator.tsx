"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, Database, AlertTriangle } from "lucide-react"

interface DataSourceIndicatorProps {
  source?: string
  className?: string
}

export function DataSourceIndicator({ source = "mock", className }: DataSourceIndicatorProps) {
  const getSourceInfo = (source: string) => {
    switch (source) {
      case "polygon":
        return {
          label: "Polygon.io",
          icon: Wifi,
          variant: "default" as const,
          color: "text-green-600",
        }
      case "alpha-vantage":
        return {
          label: "Alpha Vantage",
          icon: Wifi,
          variant: "secondary" as const,
          color: "text-blue-600",
        }
      case "mock":
        return {
          label: "Demo Data",
          icon: Database,
          variant: "outline" as const,
          color: "text-orange-600",
        }
      default:
        return {
          label: "Unknown",
          icon: AlertTriangle,
          variant: "destructive" as const,
          color: "text-red-600",
        }
    }
  }

  const sourceInfo = getSourceInfo(source)
  const Icon = sourceInfo.icon

  return (
    <Badge variant={sourceInfo.variant} className={className}>
      <Icon className={`h-3 w-3 mr-1 ${sourceInfo.color}`} />
      {sourceInfo.label}
    </Badge>
  )
}
