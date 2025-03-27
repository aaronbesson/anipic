"use client"

import { useAuth } from "@/components/auth-provider"
import { GoogleAuthButton } from "@/components/google-auth-button"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { VideoGenerator } from "@/components/video-generator"
import { VideoPlayer } from "@/components/video-player"
import { Loader2, VideoIcon } from "lucide-react"
import { useState } from "react"
export default function Home() {
  const { user, userData, loading } = useAuth()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  return (
    <main className="lg:min-h-screen bg-neutral-50">
      <Header />
      <div className="flex flex-col-reverse lg:flex-row lg:min-h-screen">
        {/* Left Column - Controls */}
        <div className={`w-full lg:w-1/2 border-t lg:border-t-0 lg:border-r border-gray-100 p-4 sm:p-6 lg:p-8  ${videoUrl ? "lg:w-1/2 max-h-screen overflow-y-auto" : "lg:w-full"}`}>
          <div className="max-w-xl mx-auto space-y-6 lg:space-y-8">

            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !user ? (
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0">
                  <CardTitle className="text-xl font-light">Sign In</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <GoogleAuthButton />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 lg:space-y-8">
                  <div className="space-y-4 lg:space-y-6">
                    <VideoGenerator onVideoGenerated={setVideoUrl} setShowPayment={setShowPayment} showPayment={showPayment} />
                  </div>

              </div>
            )}
          </div>
        </div>

        {/* Right Column - Video Preview */}
        {videoUrl && <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[50vh] lg:min-h-screen">
          {videoUrl ? (
            <div className="w-full max-w-2xl space-y-4">
              <VideoPlayer videoUrl={videoUrl} />
              <Button 
                variant="outline" 
                onClick={() => {
                  const link = document.createElement('a'); // open in new tab
                  link.target = '_blank';
                  link.href = videoUrl;
                  link.download = 'video.mp4';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full"
              >
                Download Video
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                <VideoIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-light">Upload an image to get started</h3>
              <p className="text-sm text-gray-500">Your animated video will appear here</p>
            </div>
          )}
        </div>}
      </div>


      <Toaster /> 
    </main>
  )
}

