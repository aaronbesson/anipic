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
      console.error("Signature received:", signature);
      console.error("Endpoint Secret:", endpointSecret?.substring(0, 5) + "...");
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log(`Webhook received event type: ${event.type}`);
    console.log(`Event data: ${JSON.stringify(event.data.object)}`);
    
    // Extract payment intent ID and data based on event type
    let paymentIntentId = null;
    let userId = null;
    let creditsToAdd = 0;
    
    // Handle various Stripe event types
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        paymentIntentId = paymentIntent.id;
        userId = paymentIntent.metadata?.userId;
        creditsToAdd = Number(paymentIntent.metadata?.credits || 0);
        break;
        
      case "charge.succeeded":
        const charge = event.data.object as Stripe.Charge;
        paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
          
        // If we have a payment intent ID, get the payment intent to access metadata
        if (paymentIntentId) {
          try {
            const paymentIntentData = await stripe.paymentIntents.retrieve(paymentIntentId);
            userId = paymentIntentData.metadata?.userId;
            creditsToAdd = Number(paymentIntentData.metadata?.credits || 0);
          } catch (error) {
            console.error("Error retrieving payment intent:", error);
          }
        }
        break;
        
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;
          
        // If session has metadata directly, use it
        if (session.metadata?.userId) {
          userId = session.metadata.userId;
          creditsToAdd = Number(session.metadata.credits || 0);
        }
        // Otherwise try to get payment intent
        else if (paymentIntentId) {
          try {
            const paymentIntentData = await stripe.paymentIntents.retrieve(paymentIntentId);
            userId = paymentIntentData.metadata?.userId;
            creditsToAdd = Number(paymentIntentData.metadata?.credits || 0);
          } catch (error) {
            console.error("Error retrieving payment intent:", error);
          }
        }
        break;
    }
    
    // Add credits if we have the necessary data
    if (userId && creditsToAdd > 0) {
      try {
        console.log(`Attempting to add ${creditsToAdd} credits to user ${userId}`);
        
        // Update user credits in Firestore
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          credits: increment(creditsToAdd),
          updatedAt: Date.now()
        });
        
        console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
      } catch (error) {
        console.error(`Error adding credits to user ${userId}:`, error);
      }
    } else {
      console.log("No valid userId or credits to add");
      console.log("userId:", userId);
      console.log("creditsToAdd:", creditsToAdd);
      console.log("paymentIntentId:", paymentIntentId);
      if (paymentIntentId) {
        try {
          const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          console.log("Full payment intent metadata:", fullPaymentIntent.metadata);
        } catch (err) {
          console.error("Error getting full payment intent:", err);
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