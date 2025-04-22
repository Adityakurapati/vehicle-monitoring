"use client"

import { setCookie, deleteCookie } from "cookies-next"

// Simulated authentication functions that would connect to InfluxDB in a real app
export async function loginUser(email: string, password: string): Promise<void> {
  // In a real app, this would validate credentials against InfluxDB
  // For demo purposes, we'll simulate a successful login

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if credentials are valid (in a real app, this would be a server-side check)
  if (email && password) {
    // Set auth token cookie
    setCookie("auth-token", "simulated-jwt-token", {
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return Promise.resolve()
  } else {
    return Promise.reject(new Error("Invalid credentials"))
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<void> {
  // In a real app, this would create a new user in InfluxDB
  // For demo purposes, we'll simulate a successful registration

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Check if inputs are valid
  if (name && email && password) {
    // Set auth token cookie
    setCookie("auth-token", "simulated-jwt-token", {
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return Promise.resolve()
  } else {
    return Promise.reject(new Error("Invalid registration data"))
  }
}

export async function logoutUser(): Promise<void> {
  // Delete auth token cookie
  deleteCookie("auth-token", { path: "/" })

  return Promise.resolve()
}

export function isAuthenticated(): boolean {
  // In a real app, this would validate the JWT token
  // For demo purposes, we'll just check if the cookie exists
  return document.cookie.includes("auth-token")
}
