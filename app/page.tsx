"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { GoogleAuthButton } from "@/components/google-auth-button"
import { VideoGenerator } from "@/components/video-generator"
import { VideoPlayer } from "@/components/video-player"
import { StripePaymentForm } from "@/components/stripe-payment-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, GithubIcon, VideoIcon, Upload, Settings, SparkleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default function Home() {
  const { user, userData, loading } = useAuth()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <div className="flex flex-col-reverse lg:flex-row min-h-screen">
        {/* Left Column - Controls */}
        <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-r border-gray-100 p-4 sm:p-6 lg:p-8 max-h-screen overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-6 lg:space-y-8">
            <div className="flex flex-row gap-4 items-center justify-between">
            <div className="">
              <h1 className="text-3xl lg:text-4xl font-light tracking-tight">Studio Anim</h1>
              <p className="text-gray-500">Transform your images into animated videos</p>
            </div>

            {userData?.credits && userData?.credits > 0 ? <Button
            size="sm"
            onClick={() => setShowPayment(!showPayment)}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <SparkleIcon className="h-4 w-4" />
            {userData?.credits || 0} Credits 
          </Button> : <Button
            size="sm"
            onClick={() => setShowPayment(!showPayment)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <SparkleIcon className="h-4 w-4" />
            Get Credits
          </Button>}
          </div>
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
            

                {showPayment && (
                  <StripePaymentForm />
                )}

          
                  <div className="space-y-4 lg:space-y-6">
                    <VideoGenerator onVideoGenerated={setVideoUrl} setShowPayment={setShowPayment} showPayment={showPayment} />
                  </div>
        
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Video Preview */}
        <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[50vh] lg:min-h-screen">
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
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 right-4 rounded-full">
            <VideoIcon className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div style={{position: "relative", width: "100%", height: "0px", paddingBottom: "73.469%"}}>
            <iframe allow="fullscreen;autoplay" allowFullScreen height="100%" src="https://streamable.com/e/xnq9su?autoplay=1&muted=1" width="100%" style={{border: "none", width: "100%", height: "100%", position: "absolute", left: "0px", top: "0px", overflow: "hidden"}}></iframe>
          </div>
        </DialogContent>
      </Dialog>

      {/* <Link href="https://github.com/aaronbesson/anipic" target="_blank"> 
        <Button size="icon" className="fixed bottom-4 right-4 rounded-full">
          <GithubIcon className="w-6 h-6" />
        </Button>
      </Link> */}
      <Toaster /> 
    </main>
  )
}

