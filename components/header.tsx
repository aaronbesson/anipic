"use client"

import { useAuth } from "@/components/auth-provider"
import { StripePaymentForm } from "@/components/stripe-payment-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { SparkleIcon, VideoIcon } from "lucide-react"
import { useState } from "react"

export default function Header() {
    const { user, userData, loading } = useAuth()
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [showPayment, setShowPayment] = useState(false)

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 lg:space-y-8 bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="flex flex-row gap-4 items-center justify-between">
                <div className="">
                    <h1 className="text-xl lg:text-2xl font-light tracking-tight">Studio Anim</h1>
                    <p className="text-gray-500 text-xs">Transform your images into animated videos</p>
                </div>

                <div className="flex-1" />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            onClick={() => setShowPayment(!showPayment)}
                            className="flex items-center gap-2 w-full sm:w-auto"
                        >
                            <SparkleIcon className="h-4 w-4" />
                            {userData?.credits && userData?.credits > 0 ? `${userData?.credits} Credits` : "Get Credits"}
                        </Button>

                    </DialogTrigger>
                    <DialogContent> 
                        <StripePaymentForm />
                    </DialogContent>
                </Dialog>
                <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <VideoIcon className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div style={{position: "relative", width: "100%", height: "0px", paddingBottom: "73.469%"}}>
            <iframe allow="fullscreen;autoplay" allowFullScreen height="100%" src="https://streamable.com/e/xnq9su?autoplay=1&muted=1" width="100%" style={{border: "none", width: "100%", height: "100%", position: "absolute", left: "0px", top: "0px", overflow: "hidden"}}></iframe>
          </div>
        </DialogContent>
      </Dialog>
            </div>
        </div>
    )
}

