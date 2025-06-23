"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { OptionsChain } from "@/components/options-chain"
import { Positions } from "@/components/positions"
import { AdvancedChart } from "@/components/advanced-chart"
import { Watchlist } from "@/components/watchlist"
import { OptionsCalculator } from "@/components/options-calculator"
import { PaperTrading } from "@/components/paper-trading"
import { OptionsScanner } from "@/components/options-scanner"
import { AdvancedAlerts } from "@/components/advanced-alerts"
import { MarketIntelligence } from "@/components/market-intelligence"
import { StrategyAnalyzer } from "@/components/strategy-analyzer"
import { PortfolioPage } from "@/pages/portfolio-page"
import { OptionsChainPage } from "@/pages/options-chain-page"
import { ChartsPage } from "@/pages/charts-page"
import { WatchlistPage } from "@/pages/watchlist-page"
import { AnalyticsPage } from "@/pages/analytics-page"
import { SettingsPage } from "@/pages/settings-page"
import { AIAssistantDrawer } from "@/components/ai-assistant-drawer"
import { TradeSetupPanel } from "@/components/trade-setup-panel"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { MarketDataProvider } from "@/components/market-data-provider"
import { MarketStatus } from "@/components/market-status"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard")
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  const handleSendToAI = (question: string) => {
    setIsAIAssistantOpen(true)
    // In a real implementation, you'd pass the question to the AI Assistant
    console.log("Sending to AI:", question)
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <PortfolioOverview />
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AdvancedChart />
              </div>
              <div className="space-y-4">
                <TradeSetupPanel onSendToAI={handleSendToAI} />
                <div className="lg:hidden">
                  <Watchlist />
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="hidden lg:block">
                <Watchlist />
              </div>
              <Positions />
            </div>
            <div className="grid gap-4 lg:grid-cols-1">
              <OptionsChain />
            </div>
          </div>
        )
      case "portfolio":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <PortfolioPage />
          </div>
        )
      case "options-chain":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <OptionsChainPage />
          </div>
        )
      case "charts":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <ChartsPage />
          </div>
        )
      case "watchlist":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <WatchlistPage />
          </div>
        )
      case "analytics":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <AnalyticsPage />
          </div>
        )
      case "settings":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <SettingsPage />
          </div>
        )
      case "calculator":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <OptionsCalculator />
          </div>
        )
      case "paper-trading":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <PaperTrading />
          </div>
        )
      case "scanner":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <OptionsScanner />
          </div>
        )
      case "alerts":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <AdvancedAlerts />
          </div>
        )
      case "intelligence":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <MarketIntelligence />
          </div>
        )
      case "strategies":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <StrategyAnalyzer />
          </div>
        )
      default:
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <PortfolioOverview />
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AdvancedChart />
              </div>
              <div className="space-y-4">
                <TradeSetupPanel onSendToAI={handleSendToAI} />
                <div className="lg:hidden">
                  <Watchlist />
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="hidden lg:block">
                <Watchlist />
              </div>
              <Positions />
            </div>
            <div className="grid gap-4 lg:grid-cols-1">
              <OptionsChain />
            </div>
          </div>
        )
    }
  }

  const getPageTitle = () => {
    switch (activePage) {
      case "dashboard":
        return "Options Trading Dashboard"
      case "portfolio":
        return "Portfolio Management"
      case "options-chain":
        return "Options Chain Analysis"
      case "charts":
        return "Charts & Technical Analysis"
      case "watchlist":
        return "Watchlist & Alerts"
      case "analytics":
        return "Portfolio Analytics"
      case "settings":
        return "Settings & Preferences"
      case "calculator":
        return "Options Calculator"
      case "paper-trading":
        return "Paper Trading"
      case "scanner":
        return "Options Scanner"
      case "alerts":
        return "Advanced Alerts"
      case "intelligence":
        return "Market Intelligence"
      case "strategies":
        return "Strategy Analyzer"
      default:
        return "Options Trading Dashboard"
    }
  }

  return (
    <MarketDataProvider>
      <SidebarProvider>
        <AppSidebar
          activePage={activePage}
          onPageChange={setActivePage}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAIAssistantOpen(true)}
                className="gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <Bot className="h-4 w-4" />
                AI Assistant
              </Button>
              <MarketStatus />
            </div>
          </header>
          {renderPage()}
        </SidebarInset>

        <AIAssistantDrawer isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
      </SidebarProvider>
    </MarketDataProvider>
  )
}
