"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface Alert {
  id: string
  symbol: string
  type: "price" | "volume" | "volatility" | "options"
  condition: "above" | "below" | "crosses"
  value: number
  isActive: boolean
  triggered: boolean
  createdAt: Date
}

export function AdvancedAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      symbol: "AAPL",
      type: "price",
      condition: "above",
      value: 200,
      isActive: true,
      triggered: false,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      symbol: "TSLA",
      type: "volume",
      condition: "above",
      value: 50000000,
      isActive: true,
      triggered: true,
      createdAt: new Date("2024-01-14"),
    },
  ])

  const [newAlert, setNewAlert] = useState({
    symbol: "",
    type: "price" as Alert["type"],
    condition: "above" as Alert["condition"],
    value: 0,
  })

  const addAlert = () => {
    if (newAlert.symbol && newAlert.value > 0) {
      const alert: Alert = {
        id: Date.now().toString(),
        ...newAlert,
        isActive: true,
        triggered: false,
        createdAt: new Date(),
      }
      setAlerts([...alerts, alert])
      setNewAlert({ symbol: "", type: "price", condition: "above", value: 0 })
    }
  }

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, isActive: !alert.isActive } : alert)))
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "price":
        return <TrendingUp className="h-4 w-4" />
      case "volume":
        return <TrendingDown className="h-4 w-4" />
      case "volatility":
        return <AlertTriangle className="h-4 w-4" />
      case "options":
        return <Bell className="h-4 w-4" />
    }
  }

  const alertTemplates = [
    { name: "Breakout Alert", type: "price", condition: "above", description: "Alert when price breaks resistance" },
    { name: "Support Alert", type: "price", condition: "below", description: "Alert when price hits support" },
    { name: "Volume Spike", type: "volume", condition: "above", description: "Alert on unusual volume" },
    { name: "IV Crush", type: "volatility", condition: "below", description: "Alert on volatility drop" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Alerts</h2>
          <p className="text-muted-foreground">Set up intelligent alerts for market movements</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          {alerts.filter((a) => a.isActive).length} Active
        </Badge>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">My Alerts</TabsTrigger>
          <TabsTrigger value="create">Create Alert</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={alert.triggered ? "border-orange-200 bg-orange-50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <div className="font-medium">{alert.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {alert.type} {alert.condition} {alert.value.toLocaleString()}
                        </div>
                      </div>
                      {alert.triggered && <Badge variant="destructive">Triggered</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={alert.isActive} onCheckedChange={() => toggleAlert(alert.id)} />
                      <Button variant="ghost" size="sm" onClick={() => deleteAlert(alert.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Alert</CardTitle>
              <CardDescription>Set up a custom alert for market conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="AAPL"
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Alert Type</Label>
                  <Select
                    value={newAlert.type}
                    onValueChange={(value: Alert["type"]) => setNewAlert({ ...newAlert, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="volatility">Volatility</SelectItem>
                      <SelectItem value="options">Options</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={newAlert.condition}
                    onValueChange={(value: Alert["condition"]) => setNewAlert({ ...newAlert, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                      <SelectItem value="crosses">Crosses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="0"
                    value={newAlert.value || ""}
                    onChange={(e) => setNewAlert({ ...newAlert, value: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button onClick={addAlert} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {alertTemplates.map((template, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  setNewAlert({
                    symbol: "",
                    type: template.type as Alert["type"],
                    condition: template.condition as Alert["condition"],
                    value: 0,
                  })
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
