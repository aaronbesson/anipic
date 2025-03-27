"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { ImageUploader } from "./image-uploader"
import { useAuth } from "./auth-provider"
import { useCredits } from "@/lib/userService"

type VideoGeneratorProps = {
  onVideoGenerated: (videoUrl: string) => void
}

export function VideoGenerator({ onVideoGenerated }: VideoGeneratorProps) {
  const { user, userData, refreshUserData } = useAuth()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [duration, setDuration] = useState("5")
  const [aspectRatio, setAspectRatio] = useState("9:16")
  const [loop, setLoop] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [predictionId, setPredictionId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Poll for video status when we have a prediction ID
  useEffect(() => {
    if (!predictionId) return;
    
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/check-video-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ predictionId }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to check video status");
        }
        
        const data = await response.json();
        setStatus(data.status);
        
        // If completed, stop polling and set video URL
        if (data.status === "succeeded") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setIsGenerating(false);
          setPredictionId(null);
          onVideoGenerated(data.output);
        } 
        // If failed, stop polling and show error
        else if (data.status === "failed" || data.status === "canceled") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setIsGenerating(false);
          setPredictionId(null);
          setError("Video generation failed. Please try again.");
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };
    
    // Immediately check once
    checkStatus();
    
    // Then set up polling every 3 seconds
    pollingIntervalRef.current = setInterval(checkStatus, 3000);
    
    // Clean up interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [predictionId, onVideoGenerated]);

  const handleGenerate = async () => {
    if (!imageUrl || !prompt) {
      setError("Please upload an image and provide a prompt")
      return
    }

    if (!user) {
      setError("You must be logged in to generate videos")
      return
    }

    if (!userData || userData.credits <= 0) {
      setError("You don't have enough credits. Please purchase credits to continue.")
      return
    }

    try {
      setError(null)
      setIsGenerating(true)
      setStatus("starting")

      // Client-side credit deduction
      const { initializeFirebase } = await import("@/lib/firebase")
      const { db } = await initializeFirebase()
      
      if (!db) {
        throw new Error("Firestore not initialized")
      }
      
      const { doc, updateDoc, increment } = await import("firebase/firestore")
      const userRef = doc(db, "users", user.uid)
      
      // Deduct 1 credit
      await updateDoc(userRef, {
        credits: increment(-1),
        updatedAt: Date.now()
      })

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
        // If API fails, refund the credit
        await updateDoc(userRef, {
          credits: increment(1),
          updatedAt: Date.now()
        })
        throw new Error("Failed to generate video")
      }

      const data = await response.json()
      setPredictionId(data.id)
      
      // Refresh user data to update credit display
      await refreshUserData()
    } catch (error) {
      console.error("Error generating video:", error)
      setError("Failed to generate video. Please try again.")
      setIsGenerating(false)
    }
  }

  const getStatusMessage = () => {
    if (!status) return "Preparing...";
    
    switch (status) {
      case "starting":
        return "Starting generation...";
      case "processing":
        return "Processing your video...";
      case "succeeded":
        return "Completed! Loading video...";
      case "failed":
        return "Generation failed";
      default:
        return `${status.charAt(0).toUpperCase() + status.slice(1)}...`;
    }
  };

  if (!user) {
    return null
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Generate Video</h3>
          <div className="text-sm">
            Credits: <span className="font-semibold">{userData?.credits || 0}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Upload Image</Label>
          <ImageUploader onImageUploaded={setImageUrl} isGenerating={isGenerating} />
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
              disabled={true}
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

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !imageUrl || !prompt || !userData || userData.credits <= 0} 
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {getStatusMessage()}
            </>
          ) : userData && userData.credits <= 0 ? (
            "No Credits Available"
          ) : (
            "Generate Video (1 Credit)"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

