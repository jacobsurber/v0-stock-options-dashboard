"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Key, CheckCircle } from "lucide-react"

export function ApiKeySetup() {
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [apiKey, setApiKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const providers = [
    {
      id: "iex-cloud",
      name: "IEX Cloud",
      description: "Free tier available, great for getting started",
      signupUrl: "https://iexcloud.io/",
      testKey: "pk_test_your_test_key_here",
    },
    {
      id: "polygon",
      name: "Polygon.io",
      description: "Professional-grade market data with options support",
      signupUrl: "https://polygon.io/",
      testKey: null,
    },
    {
      id: "alpha-vantage",
      name: "Alpha Vantage",
      description: "Free tier with 5 API requests per minute",
      signupUrl: "https://www.alphavantage.co/",
      testKey: null,
    },
  ]

  const validateApiKey = async () => {
    if (!apiKey || !selectedProvider) return

    setIsValidating(true)
    setIsValid(null)

    try {
      // Simple validation - try to make a test request
      const testSymbol = "AAPL"
      let testUrl = ""

      switch (selectedProvider) {
        case "iex-cloud":
          testUrl = `https://cloud.iexapis.com/v1/stock/${testSymbol}/quote?token=${apiKey}`
          break
        case "polygon":
          testUrl = `https://api.polygon.io/v2/last/nbbo/${testSymbol}?apikey=${apiKey}`
          break
        case "alpha-vantage":
          testUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${testSymbol}&apikey=${apiKey}`
          break
      }

      const response = await fetch(testUrl)
      setIsValid(response.ok)
    } catch (error) {
      setIsValid(false)
    } finally {
      setIsValidating(false)
    }
  }

  const saveApiKey = () => {
    if (isValid && apiKey && selectedProvider) {
      // In a real app, you'd save this securely
      localStorage.setItem(`${selectedProvider}_api_key`, apiKey)
      alert("API key saved! Please refresh the page to start using live data.")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Market Data API Setup
        </CardTitle>
        <CardDescription>Configure your market data provider to get live stock prices and options data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup" className="space-y-4">
          <TabsList>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="provider">Select Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a market data provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProvider && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={validateApiKey} disabled={!apiKey || isValidating} variant="outline">
                      {isValidating ? "Validating..." : "Test Connection"}
                    </Button>

                    {isValid && (
                      <Button onClick={saveApiKey} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Save & Use
                      </Button>
                    )}
                  </div>

                  {isValid === true && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        API key is valid! You can now save it to start using live market data.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isValid === false && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        API key validation failed. Please check your key and try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <div className="grid gap-4">
              {providers.map((provider) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {provider.name}
                      <Button variant="outline" size="sm" asChild>
                        <a href={provider.signupUrl} target="_blank" rel="noopener noreferrer">
                          Sign Up <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </CardHeader>
                  {provider.testKey && (
                    <CardContent>
                      <div className="text-sm">
                        <strong>Test Key:</strong> <code className="bg-muted px-1 rounded">{provider.testKey}</code>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
