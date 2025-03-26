import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Initialize Firebase directly (server-side compatible)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Create a dedicated Firebase app instance for server-side
const app = initializeApp(firebaseConfig, 'webhook-server');
const db = getFirestore(app);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Disable the default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      const error = err as Error;
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log(`Webhook received: ${event.type}`);
    
    // For payments, process and add credits
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment succeeded:", paymentIntent.id);
      console.log("Metadata:", paymentIntent.metadata);
      
      // Add credits if metadata includes userId and credits
      if (paymentIntent.metadata.userId && paymentIntent.metadata.credits) {
        const userId = paymentIntent.metadata.userId;
        const creditsToAdd = Number(paymentIntent.metadata.credits);
        
        try {
          // Update user credits in Firestore
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            credits: increment(creditsToAdd),
            updatedAt: Date.now()
          });
          
          console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
        } catch (error) {
          console.error("Error adding credits:", error);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 