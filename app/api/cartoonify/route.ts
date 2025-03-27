import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspect_ratio, start_image_url } = await req.json()

    // Validate input
    if (!start_image_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call Replicate API
    const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro-ultra/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt: prompt + " in the style of Studio Ghibli illustrations, with a cartoonish and stylized look",
          aspect_ratio: aspect_ratio || "3:2",
          image_prompt: start_image_url,
          image_prompt_strength: 0.9,
          safety_tolerance: 3,
          output_format: "jpg"
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Replicate API error:", errorData)
      return NextResponse.json({ error: "Failed to cartoonify image" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error cartoonifying image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 