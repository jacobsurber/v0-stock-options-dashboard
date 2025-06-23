"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle, Settings } from "lucide-react"

interface Provider {
  id: string
  name: string
  status: "active" | "inactive" | "error"
  features: string[]
  rateLimit: string
}

const providers: Provider[] = [
  {
    id: "polygon",
    name: "Polygon.io",
    status: "active",
    features: ["Real-time quotes", "Options data", "Historical data", "WebSocket feeds"],
    rateLimit: "5 calls/minute (free), 1000/minute (paid)",
  },
  {
    id: "alpha-vantage",
    name: "Alpha Vantage",
    status: "inactive",
    features: ["Stock quotes", "Technical indicators", "Fundamental data"],
    rateLimit: "25 calls/day (free), 75/minute (paid)",
  },
  {
    id: "iex-cloud",
    name: "IEX Cloud",
    status: "inactive",
    features: ["Real-time quotes", "Historical data", "Company data"],
    rateLimit: "100 calls/day (free), 1M/month (paid)",
  },
]

export function ProviderSelector() {
  const [selectedProvider, setSelectedProvider] = useState("polygon")
  const [autoFallback, setAutoFallback] = useState(true)
  const [apiKeys, setApiKeys] = useState({
    polygon: "",
    "alpha-vantage": "",
    "iex-cloud": "",
  })

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: value,
    }))
  }

  const testConnection = async (providerId: string) => {
    // Simulate API test
    console.log(`Testing connection to ${providerId}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Market Data Providers
        </CardTitle>
        <CardDescription>Configure and manage your market data sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Primary Provider</Label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center gap-2">
                    {provider.status === "active" ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-gray-400" />
                    )}
                    {provider.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto Fallback</Label>
            <p className="text-sm text-muted-foreground">Automatically switch to backup provider if primary fails</p>
          </div>
          <Switch checked={autoFallback} onCheckedChange={setAutoFallback} />
        </div>

        <div className="space-y-4">
          <Label>Provider Configuration</Label>
          {providers.map((provider) => (
            <div key={provider.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{provider.name}</h4>
                  <Badge
                    variant={
                      provider.status === "active"
                        ? "default"
                        : provider.status === "error"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {provider.status}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" onClick={() => testConnection(provider.id)}>
                  Test
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${provider.id}-key`}>API Key</Label>
                <Input
                  id={`${provider.id}-key`}
                  type="password"
                  placeholder="Enter API key"
                  value={apiKeys[provider.id as keyof typeof apiKeys]}
                  onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {provider.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">Rate limit: {provider.rateLimit}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button>Save Configuration</Button>
          <Button variant="outline">Test All Providers</Button>
        </div>
      </CardContent>
    </Card>
  )
}
