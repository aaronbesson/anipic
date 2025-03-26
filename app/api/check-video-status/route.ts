import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { predictionId } = await req.json()

    if (!predictionId) {
      return NextResponse.json({ error: "Missing prediction ID" }, { status: 400 })
    }

    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Replicate API error:", errorData)
      return NextResponse.json({ error: "Failed to check video status" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error checking video status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 