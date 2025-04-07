"use client"

import { useAuth } from "@/components/auth-provider"
import { GoogleAuthButton } from "@/components/google-auth-button"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { VideoGenerator } from "@/components/video-generator"
import { VideoPlayer } from "@/components/video-player"
import { ArrowRight, Loader2, VideoIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
export default function Home() {
  const { user, userData, loading } = useAuth()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const { toast } = useToast()
  // if user show toast


  return user ? (
    <main className="lg:min-h-screen bg-neutral-100">
      <Header />
      <div className="flex flex-col-reverse lg:flex-row lg:min-h-screen p-6">
        {/* Left Column - Controls */}
        <div className={`w-full border-t lg:border-t-0 lg:border-r border-gray-100 ${videoUrl ? "lg:w-1/2 max-h-screen overflow-y-auto" : "w-full lg:w-1/2 mx-auto"}`}>
          <div className="w-full mx-auto space-y-6 lg:space-y-8">

            {user && loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
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
    </main>
  ) : (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <Header />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto">
          Transform static ads, photos and artwork into <span className="inline-block bg-black text-white px-2">animated</span> content
          for all platforms
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Studio Anim helps you repurpose and animate your existing ads for Instagram, TikTok, LinkedIn, X.com, and YouTube
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <GoogleAuthButton />
          <Link href="#how-it-works" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            How Studio Anim Works <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative max-w-xl w-full bg-white h-80 mx-auto mb-16 rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <iframe allow="fullscreen" allowFullScreen height="100%" src="https://streamable.com/e/yu10aw?" width="100%" style={{ border: "none", width: "100%", height: "100%", position: "absolute", left: "0px", top: "0px", overflow: "hidden" }}></iframe>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Choose the plan that works best for your animation needs
        </p>

        <div className="gap-8 max-w-xl mx-auto">

          {/* Pro Plan */}
          <div className="border-2 border-black rounded-xl p-6 flex flex-col relative shadow-lg bg-white">
            <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <h3 className="text-xl font-bold mb-2">Professional</h3>
            <p className="text-gray-600 mb-4">For marketing teams and agencies</p>
            <div className="text-3xl font-bold mb-6">
              $9.99<span className="text-lg text-gray-500 font-normal"></span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>20 animations</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Advanced animation effects</span>
              </li>
            </ul>

            <GoogleAuthButton />
          </div>


        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Ready to transform your static ads?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of marketers who are saving time and increasing engagement with animated content
          </p>
          <div className="flex justify-center max-w-sm mx-auto">
            <GoogleAuthButton />
          </div>
        </div>
      </section>
    </div>
  )
}

