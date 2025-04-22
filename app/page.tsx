import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default function Home() {
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth-token")

  if (!authToken) {
    redirect("/login")
  }

  redirect("/dashboard")
}
