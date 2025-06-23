"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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

const popularTickers = ["SPY", "QQQ", "IWM", "TSLA", "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META"]

const strategyTypes = ["call spread", "put spread", "iron condor", "straddle", "strangle", "covered call"]

export function TradeSetupPanel({ onSendToAI }: TradeSetupPanelProps) {
  const [ticker, setTicker] = useState("")
  const [strategy, setStrategy] = useState("")
  const [expiration, setExpiration] = useState<Date>()

  const formatExpirationText = (date: Date) => {
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "today"
    if (diffDays === 1) return "tomorrow"
    if (diffDays <= 7) return `in ${diffDays} days`
    if (diffDays <= 14) return "next week"
    return `on ${format(date, "MMM do")}`
  }

  const handleSendToAI = () => {
    if (!ticker || !strategy) return

    let question = `Explain a ${ticker.toUpperCase()} ${strategy}`
    if (expiration) {
      question += ` expiring ${formatExpirationText(expiration)}`
    }
    question += ". Include entry criteria, risk management, and profit targets."

    onSendToAI(question)
  }

  const isValid = ticker && strategy

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          AI Trade Setup
        </CardTitle>
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Ticker Selection */}
        <div className="space-y-1">
          <Label htmlFor="ticker" className="text-xs">
            Ticker
          </Label>
          <Select value={ticker} onValueChange={setTicker}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {popularTickers.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Strategy Selection */}
        <div className="space-y-1">
          <Label htmlFor="strategy" className="text-xs">
            Strategy
          </Label>
          <Select value={strategy} onValueChange={setStrategy}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {strategyTypes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expiration Date */}
        <div className="space-y-1">
          <Label className="text-xs">Expiration</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-8 w-full justify-start text-left font-normal text-xs",
                  !expiration && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {expiration ? format(expiration, "MMM dd") : "Optional"}
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
          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
            <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">Preview:</p>
            <p className="text-blue-600 dark:text-blue-400 leading-tight">
              "{ticker.toUpperCase()} {strategy}
              {expiration && ` expiring ${formatExpirationText(expiration)}`}"
            </p>
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendToAI}
          disabled={!isValid}
          size="sm"
          className="w-full h-8 bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="mr-1 h-3 w-3" />
          Ask AI
        </Button>
      </CardContent>
    </Card>
  )
}
