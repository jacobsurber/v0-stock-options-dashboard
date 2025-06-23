import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Polygon API key is available
    const polygonKey = process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY

    if (!polygonKey) {
      return NextResponse.json(
        {
          connected: false,
          error: "No API key configured",
          provider: "polygon",
        },
        { status: 400 },
      )
    }

    // Test connection to Polygon API
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-01/2023-01-02?apikey=${polygonKey}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        connected: true,
        status: data.status,
        provider: "polygon",
        timestamp: new Date().toISOString(),
        errors: 0,
      })
    } else {
      return NextResponse.json(
        {
          connected: false,
          error: `API returned ${response.status}`,
          provider: "polygon",
          timestamp: new Date().toISOString(),
          errors: 1,
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      {
        connected: false,
        error: "Connection failed",
        provider: "polygon",
        timestamp: new Date().toISOString(),
        errors: 1,
      },
      { status: 500 },
    )
  }
}
