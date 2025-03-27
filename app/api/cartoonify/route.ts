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
          prompt: "Transform this into a friendly 1980s anime-style illustration inspired by Studio that rhymes with Whibli. Use soft pastel colors, hand-drawn textures, and gentle cel shading. Apply subtle linework and natural lighting with a warm, nostalgic glow. Emphasize expressive, kind-eyed characters, fluid poses, and detailed, whimsical backgrounds. The overall aesthetic should feel cozy, cinematic, and storybook-like — capturing the charm, warmth, and dreamlike atmosphere of classic Ghibli films from the 80s era.",
          aspect_ratio: aspect_ratio || "1:1",
          image_prompt: start_image_url,
          image_prompt_strength: 0.96,
          safety_tolerance: 5,
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
    
    // Poll for the final result
    let prediction = data
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between polls
      const pollResponse = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        },
      })
      prediction = await pollResponse.json()
      console.log("Polling prediction status:", prediction.status)
    }

    if (prediction.status === "failed") {
      return NextResponse.json({ error: prediction.error || "Failed to cartoonify image" }, { status: 500 })
    }

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error cartoonifying image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 