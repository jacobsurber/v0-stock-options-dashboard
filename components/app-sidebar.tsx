"use client"

import { BarChart3, DollarSign, Home, LineChart, List, Settings, TrendingUp, Wallet } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: Home,
  },
  {
    title: "Portfolio",
    url: "portfolio",
    icon: Wallet,
  },
  {
    title: "Options Chain",
    url: "options-chain",
    icon: List,
  },
  {
    title: "Charts",
    url: "charts",
    icon: LineChart,
  },
  {
    title: "Watchlist",
    url: "watchlist",
    icon: TrendingUp,
  },
  {
    title: "Analytics",
    url: "analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
]

interface AppSidebarProps {
  activePage: string
  onPageChange: (page: string) => void
}

export function AppSidebar({ activePage, onPageChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <DollarSign className="h-6 w-6" />
          <span className="font-semibold text-lg">OptionsTrader</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={activePage === item.url} onClick={() => onPageChange(item.url)}>
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
        <div className="p-2 text-xs text-muted-foreground">Market data delayed by 15 minutes</div>
      </SidebarFooter>
    </Sidebar>
  )
}
