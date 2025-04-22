"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Car,
  BarChart3,
  Settings,
  Users,
  Bell,
  Sun,
  Moon,
  Menu,
  Gauge,
  Zap,
  Thermometer,
  Activity,
  Award,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { logoutUser } from "@/lib/auth"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [level, setLevel] = useState(7)
  const [xp, setXp] = useState(75)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleLogout = async () => {
    await logoutUser()
    router.push("/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Gauge },
    { name: "Vehicles", href: "/vehicles", icon: Car },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Team", href: "/team", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const vehicleStats = [
    { name: "Temperature", value: "72°C", icon: Thermometer, color: "text-rose-500" },
    { name: "Voltage", value: "12.6V", icon: Zap, color: "text-amber-500" },
    { name: "RPM", value: "3240", icon: Activity, color: "text-emerald-500" },
  ]

  const Sidebar = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center px-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-1 rounded-md">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent font-bold">
            VehicleMetrics
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                  isActive
                    ? "bg-gradient-to-r from-purple-600/10 to-blue-500/10 text-primary"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.name}
                {item.name === "Dashboard" && <Badge className="ml-auto bg-primary text-primary-foreground">New</Badge>}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="rounded-lg bg-gradient-to-r from-purple-600/10 to-blue-500/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-medium">Fleet Manager Lv.{level}</span>
          </div>
          <div className="mb-1 flex justify-between text-xs">
            <span>XP Progress</span>
            <span>{xp}/100</span>
          </div>
          <Progress
            value={xp}
            className="h-2 bg-primary/20"
            indicatorClassName="bg-gradient-to-r from-purple-600 to-blue-500"
          />
          <div className="mt-3 text-xs text-muted-foreground">Complete daily tasks to level up!</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-white px-4 sm:px-6 shadow-sm">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        )}

        <div className="w-full flex-1" />

        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:gap-2">
            {vehicleStats.map((stat) => (
              <TooltipProvider key={stat.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-md px-3 py-1.5 shadow-sm",
                        "bg-white transition-all hover:shadow-md",
                      )}
                    >
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                      <span className="text-sm font-medium">{stat.value}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stat.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <Button variant="ghost" size="icon" className="relative" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary" />
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Log out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>FM</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex flex-1">
        {!isMobile && (
          <aside className="w-72 shrink-0 border-r border-gray-100 bg-white">
            <Sidebar />
          </aside>
        )}

        <main className="flex-1 overflow-auto">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
