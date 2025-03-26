import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { loop, prompt, duration, aspect_ratio, start_image_url } = await req.json()

    // Validate input
    if (!prompt || !start_image_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call Replicate API
    const response = await fetch("https://api.replicate.com/v1/models/luma/ray-flash-2-720p/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          loop,
          prompt,
          duration,
          aspect_ratio,
          start_image_url,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Replicate API error:", errorData)
      return NextResponse.json({ error: "Failed to generate video" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

