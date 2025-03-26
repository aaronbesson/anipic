"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { ImageUploader } from "./image-uploader"
import { useAuth } from "./auth-provider"

type VideoGeneratorProps = {
  onVideoGenerated: (videoUrl: string) => void
}

export function VideoGenerator({ onVideoGenerated }: VideoGeneratorProps) {
  const { user } = useAuth()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [duration, setDuration] = useState("5")
  const [aspectRatio, setAspectRatio] = useState("9:16")
  const [loop, setLoop] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!imageUrl || !prompt) {
      setError("Please upload an image and provide a prompt")
      return
    }

    try {
      setError(null)
      setIsGenerating(true)

      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loop,
          prompt,
          duration: Number.parseInt(duration),
          aspect_ratio: aspectRatio,
          start_image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate video")
      }

      const data = await response.json()
      onVideoGenerated(data.output)
    } catch (error) {
      console.error("Error generating video:", error)
      setError("Failed to generate video. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image">Upload Image</Label>
          <ImageUploader onImageUploaded={setImageUrl} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="A cinematic anime, group of developers, okay, thumbs up, smiles"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="10"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger id="aspect-ratio">
                <SelectValue placeholder="Select aspect ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="loop"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="loop" className="text-sm font-normal">
            Loop video
          </Label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button onClick={handleGenerate} disabled={isGenerating || !imageUrl || !prompt} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Video...
            </>
          ) : (
            "Generate Video"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

