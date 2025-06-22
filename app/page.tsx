"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { OptionsChain } from "@/components/options-chain"
import { Positions } from "@/components/positions"
import { PriceChart } from "@/components/price-chart"
import { Watchlist } from "@/components/watchlist"
import { PortfolioPage } from "@/pages/portfolio-page"
import { OptionsChainPage } from "@/pages/options-chain-page"
import { ChartsPage } from "@/pages/charts-page"
import { WatchlistPage } from "@/pages/watchlist-page"
import { AnalyticsPage } from "@/pages/analytics-page"
import { SettingsPage } from "@/pages/settings-page"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { MarketDataProvider } from "@/components/market-data-provider"
import { MarketStatus } from "@/components/market-status"

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard")

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <PortfolioOverview />
            <div className="grid gap-4 lg:grid-cols-2">
              <PriceChart />
              <Watchlist />
            </div>
            <div className="grid gap-4 lg:grid-cols-1">
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
      default:
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <PortfolioOverview />
            <div className="grid gap-4 lg:grid-cols-2">
              <PriceChart />
              <Watchlist />
            </div>
            <div className="grid gap-4 lg:grid-cols-1">
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
      default:
        return "Options Trading Dashboard"
    }
  }

  return (
    <MarketDataProvider>
      <SidebarProvider>
        <AppSidebar activePage={activePage} onPageChange={setActivePage} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <MarketStatus />
            </div>
          </header>
          {renderPage()}
        </SidebarInset>
      </SidebarProvider>
    </MarketDataProvider>
  )
}
