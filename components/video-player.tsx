"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type VideoPlayerProps = {
  videoUrl: string
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("loadeddata", () => {
        setIsLoading(false)
      })
    }
  }, [videoUrl])

  return (
    <Card className="overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay
        loop
        className="w-full h-auto"
        style={{ maxHeight: "70vh" }}
      />
    </Card>
  )
}

