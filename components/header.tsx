"use client"

import { useAuth } from "@/components/auth-provider"
import { StripePaymentForm } from "@/components/stripe-payment-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { FerrisWheelIcon, SparkleIcon } from "lucide-react"
import { useState } from "react"
import { GoogleAuthButton } from "./google-auth-button"

export default function Header() {
    const { user, userData, loading } = useAuth()
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [showPayment, setShowPayment] = useState(false)

    return (
        <div className="w-full mx-auto space-y-6 lg:space-y-8 bg-white border-b border-gray-100 sticky top-0 z-50 p-2 shadow-sm">
            <div className="flex flex-row gap-4 items-center justify-between w-full max-w-7xl mx-auto">
                <div className="flex flex-row gap-2 items-center">
                    <FerrisWheelIcon className="h-6 w-6" />
                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Studio Anim</h1>
                </div>

                <div className="flex-1" />
                {user ? <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            onClick={() => setShowPayment(!showPayment)}
                            className="flex items-center gap-2"
                        >
                            <SparkleIcon className="h-4 w-4" />
                            {userData?.credits && userData?.credits > 0 ? `${userData?.credits} Credits` : "Get Credits"}
                        </Button>

                    </DialogTrigger>
                    <DialogContent>
                        <StripePaymentForm />
                    </DialogContent>
                </Dialog> : <GoogleAuthButton />}
            </div>
        </div>
    )
}

