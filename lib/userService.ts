import { initializeFirebase } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export type UserData = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  stripeCustomerId?: string;
  credits: number;
  createdAt: number;
  updatedAt: number;
};

// Initialize or get user document in Firestore
export async function getOrCreateUser(user: User): Promise<UserData> {
  const { db } = await initializeFirebase();
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  } else {
    // Create new user document
    const userData: UserData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      credits: 0, // Start with 0 credits
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(userRef, userData);
    return userData;
  }
}

// Update user's Stripe customer ID
export async function updateStripeCustomerId(uid: string, customerId: string): Promise<void> {
  const { db } = await initializeFirebase();
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    stripeCustomerId: customerId,
    updatedAt: Date.now(),
  });
}

// Add credits to a user
export async function addCredits(uid: string, amount: number): Promise<void> {
  const { db } = await initializeFirebase();
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    credits: increment(amount),
    updatedAt: Date.now(),
  });
}

// Check if user has enough credits
export async function hasEnoughCredits(uid: string, required: number = 1): Promise<boolean> {
  const { db } = await initializeFirebase();
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return false;
  
  const userData = userSnap.data() as UserData;
  return userData.credits >= required;
}

// Deduct credits from a user
export async function useCredits(uid: string, amount: number = 1): Promise<boolean> {
  const { db } = await initializeFirebase();
  if (!db) throw new Error('Firestore not initialized');

  // First check if the user has enough credits
  const hasCredits = await hasEnoughCredits(uid, amount);
  if (!hasCredits) return false;

  // If they do, deduct the credits
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    credits: increment(-amount),
    updatedAt: Date.now(),
  });
  
  return true;
} 