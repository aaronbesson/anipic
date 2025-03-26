"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"

export function GoogleAuthButton() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      const { initializeFirebase } = await import("@/lib/firebase")
      const { auth } = await initializeFirebase()

      if (!auth) {
        throw new Error("Auth not initialized")
      }

      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth")

      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      const { initializeFirebase } = await import("@/lib/firebase")
      const { auth } = await initializeFirebase()

      if (!auth) {
        throw new Error("Auth not initialized")
      }

      const { signOut } = await import("firebase/auth")

      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    )
  }

  return (
    <Button onClick={user ? handleSignOut : handleSignIn} disabled={isLoading} className="w-full">
      {isLoading ? "Loading..." : user ? "Sign Out" : "Sign in with Google"}
    </Button>
  )
}

