// Create a module that safely initializes Firebase only on the client side
// Export a function to get the Firebase instances

// Define types for our exports
import type { Auth } from "firebase/auth"
import type { FirebaseStorage } from "firebase/storage"
import type { Firestore } from "firebase/firestore"

// Initialize with null values
let auth: Auth | null = null
let storage: FirebaseStorage | null = null
let db: Firestore | null = null
let firebaseInitialized = false

// Function to initialize Firebase
export async function initializeFirebase() {
  // Only initialize once and only on the client
  if (firebaseInitialized || typeof window === "undefined") {
    return { auth, storage, db }
  }

  try {
    // Dynamically import Firebase modules
    const { initializeApp } = await import("firebase/app")
    const { getAuth } = await import("firebase/auth")
    const { getStorage } = await import("firebase/storage")
    const { getFirestore } = await import("firebase/firestore")

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    storage = getStorage(app)
    db = getFirestore(app)
    firebaseInitialized = true
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }

  return { auth, storage, db }
}

export { auth, storage, db }

