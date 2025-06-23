"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, Loader2, Activity } from "lucide-react"

export function ApiDebugPanel() {
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const testAPI = async (provider: string, symbol = "AAPL") => {
    setIsLoading(true)
    try {
      console.log(`🔍 Testing ${provider} API for ${symbol}...`)

      const response = await fetch(`/api/market-data/quote?symbol=${symbol}`)
      const data = await response.json()

      console.log(`📊 ${provider} Response:`, data)

      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: response.ok,
          data: data,
          timestamp: new Date().toLocaleTimeString(),
        },
      }))
    } catch (error) {
      console.error(`❌ ${provider} Error:`, error)
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      }))
    }
    setIsLoading(false)
  }

  const checkEnvironmentVariables = () => {
    // This will be logged on the server side
    fetch("/api/market-data/status")
      .then((res) => res.json())
      .then((data) => {
        console.log("🔑 Environment Variables Status:", data)
        setTestResults((prev) => ({
          ...prev,
          environment: data,
        }))
      })
      .catch((err) => {
        console.error("❌ Environment Check Error:", err)
      })
  }

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          API Debug Panel
        </CardTitle>
        <CardDescription>Test and debug your market data API connections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button onClick={() => testAPI("Polygon")} disabled={isLoading} size="sm">
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Test Polygon API
          </Button>
          <Button onClick={() => testAPI("AlphaVantage")} disabled={isLoading} variant="outline" size="sm">
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Test Alpha Vantage
          </Button>
          <Button onClick={checkEnvironmentVariables} variant="outline" size="sm">
            Check API Keys
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Test Results</h3>

          {testResults.environment && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Environment Variables</h4>
              <div className="flex gap-2">
                <Badge variant={testResults.environment.polygon ? "default" : "destructive"}>
                  {testResults.environment.polygon ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  Polygon: {testResults.environment.polygon ? "Loaded" : "Missing"}
                </Badge>
                <Badge variant={testResults.environment.alphaVantage ? "default" : "destructive"}>
                  {testResults.environment.alphaVantage ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  Alpha Vantage: {testResults.environment.alphaVantage ? "Loaded" : "Missing"}
                </Badge>
              </div>
            </div>
          )}

          {Object.entries(testResults).map(([provider, result]: [string, any]) => {
            if (provider === "environment") return null

            return (
              <div key={provider} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{provider} API</h4>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    )}
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                </div>

                {result.success ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      API call successful at {result.timestamp}
                      {result.data?.symbol && ` - Got data for ${result.data.symbol}`}
                      {result.data?.price && ` - Price: $${result.data.price}`}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {result.error || "API call failed"} at {result.timestamp}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )
          })}
        </div>

        <Separator />

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Instructions:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Click "Test Polygon API" to test your Polygon.io connection</li>
            <li>Click "Test Alpha Vantage" to test your Alpha Vantage connection</li>
            <li>Check your browser console (F12) for detailed logs</li>
            <li>Look for 🔑 🔍 📡 📊 📈 emojis in the console for API activity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
