"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useAuth } from "./auth-provider"

// Load Stripe outside of component render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function StripePaymentForm() {
  const { user, refreshUserData } = useAuth()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Create payment intent when component mounts
  useEffect(() => {
    if (!user) return

    const createPaymentIntent = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
            userEmail: user.email,
          }),
        })

        if (!response.ok) {
          throw new Error("Error creating payment intent")
        }

        const { clientSecret } = await response.json()
        setClientSecret(clientSecret)
      } catch (error) {
        console.error("Error creating payment intent:", error)
        setError("Error setting up payment. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [user])

  if (!user) {
    return null
  }

  if (paymentSuccess) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Payment Successful!</CardTitle>
          <CardDescription>
            Your credits have been added to your account.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            onClick={() => {
              refreshUserData()
              setPaymentSuccess(false)
            }} 
            className="w-full"
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Purchase Credits</CardTitle>
        <CardDescription>
          Get 20 credits for $9.99. Each credit allows you to generate one video.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              onSuccess={() => {
                setPaymentSuccess(true)
                refreshUserData()
              }}
            />
          </Elements>
        ) : (
          <div className="text-center py-4 text-red-500">{error || "Unable to load payment form"}</div>
        )}
      </CardContent>
    </Card>
  )
}

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      })

      if (result.error) {
        setErrorMessage(result.error.message || "Payment failed")
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess()
      } else {
        setErrorMessage("Payment not completed. Please try again.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setErrorMessage("An error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay $9.99"
        )}
      </Button>
    </form>
  )
} 