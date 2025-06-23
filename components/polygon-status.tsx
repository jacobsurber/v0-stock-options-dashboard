"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from "lucide-react"

interface PolygonStatusData {
  connected: boolean
  lastUpdate: Date | null
  requestsUsed: number
  requestsLimit: number
  latency: number
  errors: number
}

export function PolygonStatus() {
  const [status, setStatus] = useState<PolygonStatusData>({
    connected: false,
    lastUpdate: null,
    requestsUsed: 1247,
    requestsLimit: 10000,
    latency: 0,
    errors: 0,
  })

  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkConnection = async () => {
    try {
      setIsChecking(true)
      const startTime = Date.now()

      const response = await fetch("/api/market-data/status")
      const latency = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        setStatus((prev) => ({
          ...prev,
          connected: true,
          lastUpdate: new Date(),
          latency,
          errors: data.errors || 0,
        }))
      } else {
        setStatus((prev) => ({
          ...prev,
          connected: false,
          lastUpdate: new Date(),
          latency,
          errors: prev.errors + 1,
        }))
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        connected: false,
        lastUpdate: new Date(),
        errors: prev.errors + 1,
      }))
    } finally {
      setIsChecking(false)
    }
  }

  const usagePercentage = (status.requestsUsed / status.requestsLimit) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.connected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          Polygon.io Status
        </CardTitle>
        <CardDescription>Real-time API connection monitoring</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection Status</span>
          <Badge variant={status.connected ? "default" : "destructive"}>
            {status.connected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </div>

        {status.lastUpdate && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Update</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {status.lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Latency</span>
          <Badge variant={status.latency < 100 ? "default" : status.latency < 500 ? "secondary" : "destructive"}>
            {status.latency}ms
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">API Usage</span>
            <span className="text-sm text-muted-foreground">
              {status.requestsUsed.toLocaleString()} / {status.requestsLimit.toLocaleString()}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">{usagePercentage.toFixed(1)}% of monthly limit used</div>
        </div>

        {status.errors > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recent Errors</span>
            <Badge variant="destructive">{status.errors}</Badge>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={checkConnection} disabled={isChecking}>
            {isChecking ? "Checking..." : "Test Connection"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setStatus((prev) => ({ ...prev, errors: 0 }))}>
            Clear Errors
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2">
          <p>• Green: Excellent connection (&lt;100ms)</p>
          <p>• Yellow: Good connection (100-500ms)</p>
          <p>• Red: Poor connection (&gt;500ms)</p>
        </div>
      </CardContent>
    </Card>
  )
}
