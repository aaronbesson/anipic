import { initializeFirebase } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, type Firestore } from 'firebase/firestore';
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
export async function getOrCreateUser(user: User, db?: Firestore): Promise<UserData> {
  const firebase = db ? { db } : await initializeFirebase();
  if (!firebase.db) throw new Error('Firestore not initialized');

  const userRef = doc(firebase.db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  } else {
    // Create new user document with 1 free credit
    const userData: UserData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      credits: 1, // Give 1 free credit to new users
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(userRef, userData);
    return userData;
  }
}

// Update user's Stripe customer ID
export async function updateStripeCustomerId(uid: string, customerId: string, db?: Firestore): Promise<void> {
  const firebase = db ? { db } : await initializeFirebase();
  if (!firebase.db) throw new Error('Firestore not initialized');

  const userRef = doc(firebase.db, 'users', uid);
  await updateDoc(userRef, {
    stripeCustomerId: customerId,
    updatedAt: Date.now(),
  });
}

// Add credits to a user
export async function addCredits(uid: string, amount: number, db?: Firestore): Promise<void> {
  const firebase = db ? { db } : await initializeFirebase();
  if (!firebase.db) throw new Error('Firestore not initialized');

  const userRef = doc(firebase.db, 'users', uid);
  await updateDoc(userRef, {
    credits: increment(amount),
    updatedAt: Date.now(),
  });
}

// Check if user has enough credits
export async function hasEnoughCredits(uid: string, required: number = 1, db?: Firestore): Promise<boolean> {
  const firebase = db ? { db } : await initializeFirebase();
  if (!firebase.db) throw new Error('Firestore not initialized');

  const userRef = doc(firebase.db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return false;
  
  const userData = userSnap.data() as UserData;
  return userData.credits >= required;
}

// Deduct credits from a user
export async function useCredits(uid: string, amount: number = 1, db?: Firestore): Promise<boolean> {
  const firebase = db ? { db } : await initializeFirebase();
  if (!firebase.db) throw new Error('Firestore not initialized');

  // First check if the user has enough credits
  const hasCredits = await hasEnoughCredits(uid, amount, firebase.db);
  if (!hasCredits) return false;

  // If they do, deduct the credits
  const userRef = doc(firebase.db, 'users', uid);
  await updateDoc(userRef, {
    credits: increment(-amount),
    updatedAt: Date.now(),
  });
  
  return true;
} 