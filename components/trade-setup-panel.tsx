"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, MessageSquare, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TradeSetupPanelProps {
  onSendToAI: (question: string) => void
}

const popularTickers = [
  "SPY",
  "QQQ",
  "IWM",
  "TSLA",
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "META",
  "AMD",
  "NFLX",
  "DIS",
  "BA",
  "JPM",
  "GS",
  "XLF",
  "GLD",
  "TLT",
  "VIX",
]

const strategyTypes = [
  "call spread",
  "put spread",
  "iron condor",
  "iron butterfly",
  "straddle",
  "strangle",
  "covered call",
  "cash secured put",
  "collar",
  "butterfly spread",
  "calendar spread",
  "diagonal spread",
]

export function TradeSetupPanel({ onSendToAI }: TradeSetupPanelProps) {
  const [ticker, setTicker] = useState("")
  const [strategy, setStrategy] = useState("")
  const [expiration, setExpiration] = useState<Date>()
  const [customTicker, setCustomTicker] = useState("")
  const [customStrategy, setCustomStrategy] = useState("")

  const formatExpirationText = (date: Date) => {
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "today"
    if (diffDays === 1) return "tomorrow"
    if (diffDays <= 7) return `in ${diffDays} days`
    if (diffDays <= 14) return "next week"
    if (diffDays <= 21) return "in 2 weeks"
    if (diffDays <= 30) return "next month"

    return `on ${format(date, "MMMM do")}`
  }

  const handleSendToAI = () => {
    const finalTicker = customTicker.trim() || ticker
    const finalStrategy = customStrategy.trim() || strategy

    if (!finalTicker || !finalStrategy) {
      return
    }

    let question = `Explain a ${finalTicker.toUpperCase()} ${finalStrategy}`

    if (expiration) {
      const expirationText = formatExpirationText(expiration)
      question += ` expiring ${expirationText}`
    }

    question += ". Include entry criteria, risk management, and profit targets."

    onSendToAI(question)
  }

  const isValid = (customTicker.trim() || ticker) && (customStrategy.trim() || strategy)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Trade Setup Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ticker Selection */}
        <div className="space-y-2">
          <Label htmlFor="ticker">Ticker Symbol</Label>
          <Select value={ticker} onValueChange={setTicker}>
            <SelectTrigger>
              <SelectValue placeholder="Select ticker..." />
            </SelectTrigger>
            <SelectContent>
              {popularTickers.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Or enter custom ticker..."
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
            className="text-sm"
          />
        </div>

        {/* Strategy Selection */}
        <div className="space-y-2">
          <Label htmlFor="strategy">Options Strategy</Label>
          <Select value={strategy} onValueChange={setStrategy}>
            <SelectTrigger>
              <SelectValue placeholder="Select strategy..." />
            </SelectTrigger>
            <SelectContent>
              {strategyTypes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Or enter custom strategy..."
            value={customStrategy}
            onChange={(e) => setCustomStrategy(e.target.value.toLowerCase())}
            className="text-sm"
          />
        </div>

        {/* Expiration Date */}
        <div className="space-y-2">
          <Label>Expiration Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !expiration && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiration ? format(expiration, "PPP") : "Select expiration..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiration}
                onSelect={setExpiration}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Preview */}
        {isValid && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">AI Question Preview:</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              "Explain a {(customTicker.trim() || ticker).toUpperCase()} {customStrategy.trim() || strategy}
              {expiration && ` expiring ${formatExpirationText(expiration)}`}. Include entry criteria, risk management,
              and profit targets."
            </p>
          </div>
        )}

        {/* Send Button */}
        <Button onClick={handleSendToAI} disabled={!isValid} className="w-full bg-blue-600 hover:bg-blue-700">
          <MessageSquare className="mr-2 h-4 w-4" />
          Ask AI Assistant
        </Button>
      </CardContent>
    </Card>
  )
}
