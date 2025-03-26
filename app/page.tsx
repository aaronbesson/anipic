"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { GoogleAuthButton } from "@/components/google-auth-button"
import { VideoGenerator } from "@/components/video-generator"
import { VideoPlayer } from "@/components/video-player"
import { StripePaymentForm } from "@/components/stripe-payment-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { user, userData, loading } = useAuth()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Studio Anim</h1>
          <p className="mt-2 text-gray-600">Sign in, upload an image, and generate a video with AI</p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <GoogleAuthButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img
                    src={user.photoURL || "/placeholder.svg?height=32&width=32"}
                    alt={user.displayName || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                  <span>Welcome, {user.displayName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div>
                  <p className="text-sm">
                    Credits: <span className="font-semibold">{userData?.credits || 0}</span>
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setShowPayment(!showPayment)}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <CreditCard className="h-4 w-4" />
                  {showPayment ? "Hide Payment" : "Buy Credits"}
                </Button>
              </CardContent>
            </Card>

            {showPayment && (
              <StripePaymentForm />
            )}

            {videoUrl ? (
              <div className="space-y-4">
                <VideoPlayer videoUrl={videoUrl} />
                <button onClick={() => setVideoUrl(null)} className="text-sm text-primary hover:underline">
                  Generate another video
                </button>
              </div>
            ) : (
              <VideoGenerator onVideoGenerated={setVideoUrl} />
            )}
          </div>
        )}
      </div>
    </main>
  )
}

