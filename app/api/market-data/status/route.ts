import { NextResponse } from "next/server"

// Your Polygon.io API key
const POLYGON_API_KEY = "hoqphq9tFcgd8ZqOq97FZbHblrBEFesd"

export async function GET() {
  try {
    // Try to fetch market status from Polygon
    const response = await fetch(`https://api.polygon.io/v1/marketstatus/now?apikey=${POLYGON_API_KEY}`)

    if (response.ok) {
      const data = await response.json()

      return NextResponse.json({
        isOpen: data.market === "open",
        nextOpen: data.serverTime || new Date().toISOString(),
        nextClose: data.serverTime || new Date().toISOString(),
        serverTime: data.serverTime || new Date().toISOString(),
        polygonStatus: "connected",
        message: "Successfully connected to Polygon.io API",
      })
    } else {
      throw new Error(`Polygon API error: ${response.status}`)
    }
  } catch (error) {
    console.error("Market status API error:", error)

    // Return mock status as fallback
    const now = new Date()
    const isMarketHours = now.getHours() >= 9 && now.getHours() < 16 && now.getDay() >= 1 && now.getDay() <= 5

    return NextResponse.json({
      isOpen: isMarketHours,
      nextOpen: "9:30 AM EST",
      nextClose: "4:00 PM EST",
      serverTime: now.toISOString(),
      polygonStatus: "error",
      message: "Using fallback data - Polygon.io connection failed",
    })
  }
}
