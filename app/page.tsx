"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { PriceChart } from "@/components/price-chart"
import { Watchlist } from "@/components/watchlist"
import { Positions } from "@/components/positions"
import { OptionsChain } from "@/components/options-chain"
import { AdvancedChart } from "@/components/advanced-chart"
import { OptionsCalculator } from "@/components/options-calculator"
import { PaperTrading } from "@/components/paper-trading"
import { OptionsScanner } from "@/components/options-scanner"
import { AdvancedAlerts } from "@/components/advanced-alerts"
import { MarketIntelligence } from "@/components/market-intelligence"
import { StrategyAnalyzer } from "@/components/strategy-analyzer"
import { AIAssistantDrawer } from "@/components/ai-assistant-drawer"
import { TradeSetupPanel } from "@/components/trade-setup-panel"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  const handleSendToAI = (question: string) => {
    // Open AI Assistant and send the question
    setIsAIAssistantOpen(true)
    // Note: In a real implementation, you'd pass the question to the AI Assistant
    // For now, the user can copy-paste or the AI Assistant will see it in context
    console.log("Sending to AI:", question)
  }

  const renderPage = () => {
    switch (currentPage) {
      case "portfolio":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <PortfolioOverview />
            <Positions />
          </div>
        )
      case "options-chain":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Options Chain</h1>
            <OptionsChain />
          </div>
        )
      case "charts":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Advanced Charts</h1>
            <AdvancedChart />
          </div>
        )
      case "watchlist":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Watchlist</h1>
            <Watchlist />
          </div>
        )
      case "analytics":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OptionsScanner />
              <AdvancedAlerts />
              <MarketIntelligence />
              <StrategyAnalyzer />
            </div>
          </div>
        )
      case "calculator":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Options Calculator</h1>
            <OptionsCalculator />
          </div>
        )
      case "paper-trading":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Paper Trading</h1>
            <PaperTrading />
          </div>
        )
      case "settings":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Options Trading Dashboard</h1>
              <Button onClick={() => setIsAIAssistantOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Bot className="mr-2 h-4 w-4" />
                AI Assistant
              </Button>
            </div>

            {/* Trade Setup Panel */}
            <div className="mb-6">
              <TradeSetupPanel onSendToAI={handleSendToAI} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PortfolioOverview />
              <PriceChart />
              <Watchlist />
              <Positions />
            </div>
            <OptionsChain />
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
          </div>
          {renderPage()}
        </main>
        <AIAssistantDrawer isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
      </div>
    </SidebarProvider>
  )
}
