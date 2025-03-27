import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateStripeCustomerId } from "@/lib/userService";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
const app = initializeApp(firebaseConfig, 'payment-server');
const db = getFirestore(app);

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail } = await req.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "User ID and email are required" },
        { status: 400 }
      );
    }

    // Check if customer already exists in Stripe or create a new one
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // Create a new customer
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });

      // Store Stripe customer ID in Firestore using server-side db instance
      await updateStripeCustomerId(userId, customer.id, db);
    }

    // Create a payment intent for 20 credits at $9.99
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999, // $9.99 in cents
      currency: "usd",
      customer: customer.id,
      metadata: {
        userId: userId,
        credits: 20, // 20 credits to be added
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 