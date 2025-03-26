"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"

type ImageUploaderProps = {
  onImageUploaded: (imageUrl: string) => void
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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

      const storageRef = ref(storage, `images/${user.uid}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(snapshot.ref)

      onImageUploaded(downloadUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
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
          <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-64 object-cover" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </Card>
      ) : (
        <Card
          className="border-dashed border-2 h-64 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={triggerFileInput}
        >
          <div className="text-center p-4">
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click to upload an image</p>
          </div>
        </Card>
      )}

      <Button onClick={triggerFileInput} disabled={isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload Image"
        )}
      </Button>
    </div>
  )
}

