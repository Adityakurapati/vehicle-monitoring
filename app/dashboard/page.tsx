import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import VehicleMonitoringDashboard from "@/components/vehicle-monitoring-dashboard"

export default function DashboardPage() {
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth-token")

  if (!authToken) {
    redirect("/login")
  }

  return (
    <DashboardLayout>
      <VehicleMonitoringDashboard />
    </DashboardLayout>
  )
}
