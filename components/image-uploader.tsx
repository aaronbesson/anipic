"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, PaintbrushIcon, Upload, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "./auth-provider"
  
type ImageUploaderProps = {
  onImageUploaded: (imageUrl: string) => void;
  isGenerating: boolean;
}

export function ImageUploader({ onImageUploaded, isGenerating }: ImageUploaderProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [cartoonifiedUrl, setCartoonifiedUrl] = useState<string | null>(null)
  const [isCartoonifying, setIsCartoonifying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file || !user) return

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Firebase
      setIsUploading(true)

      const { initializeFirebase } = await import("@/lib/firebase")
      const { storage } = await initializeFirebase()

      if (!storage) {
        throw new Error("Storage not initialized")
      }

      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")

      const storageRef = ref(storage, `images/${user.uid}/${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(snapshot.ref)

      onImageUploaded(downloadUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Firebase
      setIsUploading(true)

      const { initializeFirebase } = await import("@/lib/firebase")
      const { storage } = await initializeFirebase()

      if (!storage) {
        throw new Error("Storage not initialized")
      }

      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")

      const storageRef = ref(storage, `images/${user.uid}/${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(snapshot.ref)
      toast({
        title: "Studio Anim Tip",
        description: "Use the paintbrush icon to apply a cartoon style to your image.",
        duration: 5000,
      })
      onImageUploaded(downloadUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCartoonify = async () => {
    if (!previewUrl) return

    try {
      setIsCartoonifying(true)
      const response = await fetch("/api/cartoonify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_image_url: previewUrl,
          aspect_ratio: "1:1",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cartoonify image")
      }

      const data = await response.json()
      console.log("Cartoonify response:", data)

      if (data.output) {
        setCartoonifiedUrl(data.output)
        setPreviewUrl(data.output)
        onImageUploaded(data.output)
      } else {
        throw new Error("No output URL received from cartoonify API")
      }
    } catch (error) {
      console.error("Error cartoonifying image:", error)
    } finally {
      setIsCartoonifying(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!isClient || !user) {
    return null
  }
  

  return (
    <div className="w-full space-y-4">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    
      {previewUrl ? (
        <Card className="overflow-hidden relative">
          <Button variant="outline" size="icon" className="absolute top-14 right-2 z-10 rounded-full" onClick={() => setPreviewUrl(null)}>
            <XIcon className="w-5 h-5" /> 
          </Button>
          <img 
            src={cartoonifiedUrl || previewUrl || "/placeholder.svg"} 
            alt="Preview" 
            className="w-full h-auto object-cover" 
          />
          {(isUploading || isCartoonifying) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </Card>
      ) : (
        <Card
          className={`border-dashed border-2 h-80 flex items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
          }`}
          onClick={triggerFileInput}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-center p-4">
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {isDragging ? 'Drop your image here' : 'Click here or drag and drop to upload an image'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

