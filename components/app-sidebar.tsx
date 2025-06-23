"use client"

import type React from "react"
import {
  Home,
  PieChart,
  Link,
  BarChart3,
  Eye,
  TrendingUp,
  Calculator,
  DollarSign,
  Search,
  Target,
  Newspaper,
  Bell,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activePage: string
  onPageChange: (page: string) => void
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activePage, onPageChange }) => {
  const items = [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      isActive: activePage === "dashboard",
      onClick: () => onPageChange("dashboard"),
    },
    {
      title: "Portfolio",
      url: "#",
      icon: PieChart,
      isActive: activePage === "portfolio",
      onClick: () => onPageChange("portfolio"),
    },
    {
      title: "Options Chain",
      url: "#",
      icon: Link,
      isActive: activePage === "options-chain",
      onClick: () => onPageChange("options-chain"),
    },
    {
      title: "Charts",
      url: "#",
      icon: BarChart3,
      isActive: activePage === "charts",
      onClick: () => onPageChange("charts"),
    },
    {
      title: "Watchlist",
      url: "#",
      icon: Eye,
      isActive: activePage === "watchlist",
      onClick: () => onPageChange("watchlist"),
    },
    {
      title: "Analytics",
      url: "#",
      icon: TrendingUp,
      isActive: activePage === "analytics",
      onClick: () => onPageChange("analytics"),
    },
  ]

  const tradingItems = [
    {
      title: "Calculator",
      url: "#",
      icon: Calculator,
      isActive: activePage === "calculator",
      onClick: () => onPageChange("calculator"),
    },
    {
      title: "Paper Trading",
      url: "#",
      icon: DollarSign,
      isActive: activePage === "paper-trading",
      onClick: () => onPageChange("paper-trading"),
    },
    {
      title: "Options Scanner",
      url: "#",
      icon: Search,
      isActive: activePage === "scanner",
      onClick: () => onPageChange("scanner"),
    },
    {
      title: "Strategy Analyzer",
      url: "#",
      icon: Target,
      isActive: activePage === "strategies",
      onClick: () => onPageChange("strategies"),
    },
  ]

  const intelligenceItems = [
    {
      title: "Market Intelligence",
      url: "#",
      icon: Newspaper,
      isActive: activePage === "intelligence",
      onClick: () => onPageChange("intelligence"),
    },
    {
      title: "Advanced Alerts",
      url: "#",
      icon: Bell,
      isActive: activePage === "alerts",
      onClick: () => onPageChange("alerts"),
    },
  ]

  const settingsItems = [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isActive: activePage === "settings",
      onClick: () => onPageChange("settings"),
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <DollarSign className="h-6 w-6" />
          <span className="font-semibold text-lg">OptionsTrader Pro</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton onClick={item.onClick} isActive={item.isActive}>
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel>Trading Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tradingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick} isActive={item.isActive}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Market Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {intelligenceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick} isActive={item.isActive}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick} isActive={item.isActive}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 text-xs text-muted-foreground">Professional Options Trading Platform</div>
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar }
