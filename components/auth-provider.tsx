"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import type { UserData } from "@/lib/userService"
import { getOrCreateUser } from "@/lib/userService"

type AuthContextType = {
  user: User | null
  userData: UserData | null
  loading: boolean
  refreshUserData: () => Promise<UserData | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => null,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUserData = async () => {
    if (!user) return null;
    try {
      const userData = await getOrCreateUser(user);
      setUserData(userData);
      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  useEffect(() => {
    // Only import and initialize Firebase on the client side
    const initializeAuth = async () => {
      try {
        const { initializeFirebase } = await import("@/lib/firebase")
        const { auth } = await initializeFirebase()

        if (!auth) {
          console.error("Auth not initialized")
          setLoading(false)
          return () => {}
        }

        const { onAuthStateChanged } = await import("firebase/auth")

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user)
          
          if (user) {
            try {
              const userData = await getOrCreateUser(user);
              setUserData(userData);
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          } else {
            setUserData(null);
          }
          
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error("Error initializing auth:", error)
        setLoading(false)
        return () => {}
      }
    }

    // Initialize auth and store the unsubscribe function
    const unsubscribePromise = initializeAuth()

    // Cleanup function
    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe()
        }
      })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

