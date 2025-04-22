"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Thermometer,
  Zap,
  Battery,
  Gauge,
  AlertTriangle,
  Award,
  Shield,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  GaugeIcon as Speedometer,
  Weight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
} from "recharts"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import VehicleModel from "@/components/vehicle-model"
import ThreeDPieChart from "@/components/three-d-pie-chart"
import { generateMockData } from "@/lib/mock-data"

export default function VehicleMonitoringDashboard() {
  const [activeVehicle, setActiveVehicle] = useState("Vehicle-001")
  const [timeRange, setTimeRange] = useState("24h")
  const [data, setData] = useState(() => generateMockData(24))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showRealTimeUpdates, setShowRealTimeUpdates] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [viewMode, setViewMode] = useState("standard")
  const [achievements, setAchievements] = useState([
    { id: 1, name: "Perfect Maintenance", completed: true, icon: CheckCircle2 },
    { id: 2, name: "Efficiency Expert", completed: true, icon: Zap },
    { id: 3, name: "Safety Champion", completed: false, icon: Shield },
    { id: 4, name: "Fleet Master", completed: false, icon: Award },
  ])
  const [showAchievement, setShowAchievement] = useState(false)
  const [currentAchievement, setCurrentAchievement] = useState(null)
  const [performanceScore, setPerformanceScore] = useState(87)
  const [hoverCard, setHoverCard] = useState(null)

  const refreshInterval = useRef(null)

  useEffect(() => {
    if (showRealTimeUpdates) {
      // Simulate real-time data updates
      refreshInterval.current = setInterval(() => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().getTime(),
          temperature: Math.floor(70 + Math.random() * 20),
          voltage: (12 + Math.random() * 1).toFixed(1),
          current: Math.floor(10 + Math.random() * 5),
          rpm: Math.floor(2000 + Math.random() * 2000),
          tilt: Math.floor(Math.random() * 30),
          speed: Math.floor(40 + Math.random() * 60),
          weight: Math.floor(1200 + Math.random() * 300),
        }

        setData((prev) => [...prev.slice(1), newPoint])

        // Randomly update performance score
        setPerformanceScore((prev) => {
          const change = Math.random() > 0.5 ? 1 : -1
          const newScore = prev + change
          return Math.min(Math.max(newScore, 60), 98) // Keep between 60 and 98
        })

        // Randomly trigger achievement notification
        if (Math.random() > 0.95 && !showAchievement) {
          const uncompletedAchievements = achievements.filter((a) => !a.completed)
          if (uncompletedAchievements.length > 0) {
            const randomAchievement =
              uncompletedAchievements[Math.floor(Math.random() * uncompletedAchievements.length)]
            setCurrentAchievement(randomAchievement)
            setShowAchievement(true)

            // Update achievements
            setAchievements((prev) => prev.map((a) => (a.id === randomAchievement.id ? { ...a, completed: true } : a)))

            // Hide notification after 5 seconds
            setTimeout(() => {
              setShowAchievement(false)
            }, 5000)
          }
        }
      }, 3000)
    } else if (refreshInterval.current) {
      clearInterval(refreshInterval.current)
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current)
      }
    }
  }, [achievements, showAchievement, showRealTimeUpdates])

  const refreshData = () => {
    setIsRefreshing(true)

    // Simulate data refresh
    setTimeout(() => {
      setData(generateMockData(timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30))
      setIsRefreshing(false)
    }, 1000)
  }

  const handleTimeRangeChange = (value) => {
    setTimeRange(value)
    setIsRefreshing(true)

    // Simulate data refresh based on new time range
    setTimeout(() => {
      setData(generateMockData(value === "24h" ? 24 : value === "7d" ? 7 : 30))
      setIsRefreshing(false)
    }, 1000)
  }

  const getStatusColor = (value, type) => {
    if (type === "temperature") {
      return value > 85 ? "text-red-500" : value > 75 ? "text-amber-500" : "text-emerald-500"
    }
    if (type === "voltage") {
      return value < 11.5 ? "text-red-500" : value < 12.3 ? "text-amber-500" : "text-emerald-500"
    }
    if (type === "rpm") {
      return value > 4000 ? "text-red-500" : value > 3500 ? "text-amber-500" : "text-emerald-500"
    }
    if (type === "tilt") {
      return value > 20 ? "text-red-500" : value > 10 ? "text-amber-500" : "text-emerald-500"
    }
    if (type === "speed") {
      return value > 80 ? "text-red-500" : value > 60 ? "text-amber-500" : "text-emerald-500"
    }
    if (type === "weight") {
      return value > 1400 ? "text-red-500" : value > 1300 ? "text-amber-500" : "text-emerald-500"
    }
    return "text-emerald-500"
  }

  const getStatusText = (value, type) => {
    if (type === "temperature") {
      return value > 85 ? "Critical" : value > 75 ? "Warning" : "Normal"
    }
    if (type === "voltage") {
      return value < 11.5 ? "Low" : value < 12.3 ? "Warning" : "Normal"
    }
    if (type === "rpm") {
      return value > 4000 ? "High" : value > 3500 ? "Warning" : "Normal"
    }
    if (type === "tilt") {
      return value > 20 ? "Danger" : value > 10 ? "Warning" : "Stable"
    }
    if (type === "speed") {
      return value > 80 ? "High" : value > 60 ? "Warning" : "Normal"
    }
    if (type === "weight") {
      return value > 1400 ? "Overload" : value > 1300 ? "Warning" : "Normal"
    }
    return "Normal"
  }

  const latestData = data[data.length - 1]

  const temperatureData = data.map((d) => ({
    time: d.time,
    timestamp: d.timestamp,
    value: d.temperature,
  }))

  const voltageData = data.map((d) => ({
    time: d.time,
    timestamp: d.timestamp,
    value: Number.parseFloat(d.voltage),
  }))

  const rpmData = data.map((d) => ({
    time: d.time,
    timestamp: d.timestamp,
    value: d.rpm,
  }))

  const tiltData = data.map((d) => ({
    time: d.time,
    timestamp: d.timestamp,
    value: d.tilt,
  }))

  const speedData = data.map((d) => ({
    time: d.time,
    timestamp: d.timestamp,
    value: d.speed,
  }))

  const weightData = data.map((d) => ({
    time: d.time,
    timestamp: d.timestamp,
    value: d.weight,
  }))

  const sensorHealthData = [
    { name: "Active", value: 12 },
    { name: "Warning", value: 2 },
    { name: "Inactive", value: 1 },
  ]

  const performanceData = [
    { metric: "Efficiency", value: 92 },
    { metric: "Reliability", value: 88 },
    { metric: "Safety", value: 95 },
    { metric: "Maintenance", value: 78 },
    { metric: "Fuel Economy", value: 85 },
  ]

  const radarData = [
    { subject: "Efficiency", A: 92, fullMark: 100 },
    { subject: "Reliability", A: 88, fullMark: 100 },
    { subject: "Safety", A: 95, fullMark: 100 },
    { subject: "Maintenance", A: 78, fullMark: 100 },
    { subject: "Fuel Economy", A: 85, fullMark: 100 },
  ]

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"]

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border-0">
          <p className="text-xs font-medium">{formatTime(payload[0]?.payload?.timestamp)}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const metricCards = [
    {
      id: "temperature",
      title: "Temperature",
      value: `${latestData.temperature}°C`,
      subtitle: "Engine Temperature",
      icon: Thermometer,
      status: getStatusText(latestData.temperature, "temperature"),
      statusColor: getStatusColor(latestData.temperature, "temperature"),
      data: temperatureData,
      gradient: {
        id: "temperatureGradient",
        colors: ["#ef4444", "#ef4444"],
      },
    },
    {
      id: "voltage",
      title: "Voltage",
      value: `${latestData.voltage}V`,
      subtitle: "Battery Voltage",
      icon: Battery,
      status: getStatusText(latestData.voltage, "voltage"),
      statusColor: getStatusColor(latestData.voltage, "voltage"),
      data: voltageData,
      gradient: {
        id: "voltageGradient",
        colors: ["#f59e0b", "#f59e0b"],
      },
    },
    {
      id: "rpm",
      title: "RPM",
      value: latestData.rpm,
      subtitle: "Engine Speed",
      icon: Gauge,
      status: getStatusText(latestData.rpm, "rpm"),
      statusColor: getStatusColor(latestData.rpm, "rpm"),
      data: rpmData,
      gradient: {
        id: "rpmGradient",
        colors: ["#10b981", "#10b981"],
      },
    },
    {
      id: "tilt",
      title: "Tilt Angle",
      value: `${latestData.tilt}°`,
      subtitle: "Vehicle Inclination",
      icon: AlertTriangle,
      status: getStatusText(latestData.tilt, "tilt"),
      statusColor: getStatusColor(latestData.tilt, "tilt"),
      data: tiltData,
      gradient: {
        id: "tiltGradient",
        colors: ["#8b5cf6", "#8b5cf6"],
      },
    },
    {
      id: "speed",
      title: "Speed",
      value: `${latestData.speed} km/h`,
      subtitle: "Vehicle Speed",
      icon: Speedometer,
      status: getStatusText(latestData.speed, "speed"),
      statusColor: getStatusColor(latestData.speed, "speed"),
      data: speedData,
      gradient: {
        id: "speedGradient",
        colors: ["#3b82f6", "#3b82f6"],
      },
    },
    {
      id: "weight",
      title: "Weight",
      value: `${latestData.weight} kg`,
      subtitle: "Vehicle Load",
      icon: Weight,
      status: getStatusText(latestData.weight, "weight"),
      statusColor: getStatusColor(latestData.weight, "weight"),
      data: weightData,
      gradient: {
        id: "weightGradient",
        colors: ["#ec4899", "#ec4899"],
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Vehicle Performance Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time monitoring and analysis of vehicle performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={activeVehicle} onValueChange={setActiveVehicle}>
            <SelectTrigger className="w-[180px] shadow-sm border-0">
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Vehicle-001">Vehicle-001</SelectItem>
              <SelectItem value="Vehicle-002">Vehicle-002</SelectItem>
              <SelectItem value="Vehicle-003">Vehicle-003</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 rounded-md bg-white shadow-sm px-3 py-1">
            <Label htmlFor="real-time-toggle" className="text-xs">
              Real-time
            </Label>
            <Switch
              id="real-time-toggle"
              checked={showRealTimeUpdates}
              onCheckedChange={setShowRealTimeUpdates}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-blue-500"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={refreshData}
            disabled={isRefreshing}
            className="bg-gradient-to-r from-purple-600/10 to-blue-500/10 hover:from-purple-600/20 hover:to-blue-500/20 shadow-sm border-0"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="sr-only">Refresh data</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.02, translateY: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            onHoverStart={() => setHoverCard(card.id)}
            onHoverEnd={() => setHoverCard(null)}
          >
            <Card
              className={cn(
                "overflow-hidden transition-all duration-300 shadow-lg border-0",
                expanded === card.id ? "col-span-2 row-span-2" : "",
                hoverCard === card.id ? "shadow-xl ring-1 ring-primary/20" : "",
              )}
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <card.icon className={cn("h-4 w-4", card.statusColor)} />
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(card.id)}>
                    {expanded === card.id ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "bg-white/50 backdrop-blur-sm shadow-sm border-0",
                      card.statusColor,
                      expanded === card.id ? "text-base" : "text-xs",
                    )}
                  >
                    {card.status}
                  </Badge>
                </div>
              </CardContent>
              <div className={cn("w-full", expanded === card.id ? "h-[300px]" : "h-[80px]")}>
                <ResponsiveContainer width="100%" height="100%">
                  {expanded === card.id ? (
                    <ComposedChart data={card.data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id={card.gradient.id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={card.gradient.colors[0]} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={card.gradient.colors[1]} stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 10 }}
                        tickFormatter={formatTime}
                        domain={["dataMin", "dataMax"]}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={card.gradient.colors[0]}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#${card.gradient.id})`}
                      />
                      <Scatter dataKey="value" fill={card.gradient.colors[0]} />
                    </ComposedChart>
                  ) : (
                    <AreaChart data={card.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={card.gradient.id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={card.gradient.colors[0]} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={card.gradient.colors[1]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={card.gradient.colors[0]}
                        strokeWidth={2}
                        fill={`url(#${card.gradient.id})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card
          className="col-span-7 md:col-span-5 overflow-hidden shadow-lg border-0"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Real-time monitoring of key vehicle parameters</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs
                defaultValue="24h"
                value={timeRange}
                onValueChange={handleTimeRangeChange}
                className="bg-gradient-to-r from-purple-600/10 to-blue-500/10 rounded-md p-1"
              >
                <TabsList className="bg-transparent">
                  <TabsTrigger
                    value="24h"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  >
                    24h
                  </TabsTrigger>
                  <TabsTrigger
                    value="7d"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  >
                    7d
                  </TabsTrigger>
                  <TabsTrigger
                    value="30d"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  >
                    30d
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="voltGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="rpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatTime}
                    domain={["dataMin", "dataMax"]}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#8884d8", strokeWidth: 1, strokeDasharray: "5 5" }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°C)"
                    stroke="#ef4444"
                    fill="url(#tempGradient)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    animationDuration={500}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="voltage"
                    name="Voltage (V)"
                    stroke="#f59e0b"
                    fill="url(#voltGradient)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    animationDuration={500}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="rpm"
                    name="RPM"
                    stroke="#10b981"
                    fill="url(#rpmGradient)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    animationDuration={500}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="speed"
                    name="Speed (km/h)"
                    stroke="#3b82f6"
                    fill="url(#speedGradient)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    animationDuration={500}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    name="Weight (kg)"
                    stroke="#ec4899"
                    fill="url(#weightGradient)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    animationDuration={500}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-7 md:col-span-2 space-y-4">
          <motion.div whileHover={{ scale: 1.02, translateY: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card
              className="overflow-hidden shadow-lg border-0"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardHeader>
                <CardTitle>Sensor Health</CardTitle>
                <CardDescription>Status of all vehicle sensors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ThreeDPieChart data={sensorHealthData} colors={["#10b981", "#f59e0b", "#ef4444"]} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {sensorHealthData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-center">
                      <div className="mr-1 h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, translateY: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card
              className="overflow-hidden shadow-lg border-0"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Vehicle performance milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={achievement.completed ? { opacity: 1 } : { opacity: 0.5 }}
                      animate={achievement.completed ? { opacity: 1 } : { opacity: 0.5 }}
                      whileHover={{ scale: 1.03 }}
                      className={cn(
                        "flex items-center gap-2 rounded-lg p-2 shadow-sm",
                        achievement.completed ? "bg-gradient-to-r from-purple-600/20 to-blue-500/10" : "bg-white/50",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          achievement.completed
                            ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                            : "bg-gray-200",
                        )}
                      >
                        <achievement.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-sm">{achievement.name}</div>
                      {achievement.completed && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div whileHover={{ scale: 1.01, translateY: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card
            className="relative overflow-hidden shadow-lg border-0"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardHeader>
              <CardTitle>Vehicle Status</CardTitle>
              <CardDescription>3D model with real-time monitoring</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
              <div className="relative h-[300px] w-full">
                <VehicleModel tilt={latestData.tilt} speed={latestData.speed} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 grid-rows-2">
          <motion.div whileHover={{ scale: 1.02, translateY: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card
              className="shadow-lg border-0"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardHeader>
                <CardTitle>Performance Score</CardTitle>
                <CardDescription>Overall vehicle health and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative flex h-32 w-32 items-center justify-center">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#8b5cf6" floodOpacity="0.5" />
                        </filter>
                      </defs>
                      <circle
                        className="text-gray-100"
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="8"
                        fill="none"
                        stroke="currentColor"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="8"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - performanceScore / 100)}
                        transform="rotate(-90 50 50)"
                        filter="url(#shadow)"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                        {performanceScore}
                      </span>
                      <span className="text-xs text-muted-foreground">out of 100</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, translateY: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card
              className="shadow-lg border-0"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#8884d8" strokeOpacity={0.2} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "currentColor", fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <defs>
                        <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="url(#radarGradient)"
                        fill="url(#radarGradient)"
                        fillOpacity={0.6}
                      />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Achievement notification */}
      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50 max-w-sm overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 p-1 shadow-lg"
          >
            <div className="rounded-md bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Achievement Unlocked!</h4>
                  <p className="text-sm text-muted-foreground">{currentAchievement.name}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
