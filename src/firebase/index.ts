import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, PhoneAuthProvider, signInWithCredential, ConfirmationResult, User, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './config';

// Initialize Firebase - try/catch to handle different environments
let app: FirebaseApp;
let auth: any;
let firestore: any;
let realtimeDb: any;
let phoneAuthProvider: any;
let initializationError: string | null = null;

try {
  if (getApps().length === 0) {
    // For React Native (Expo)
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Firebase already initialized');
  }

  auth = getAuth(app);
  phoneAuthProvider = new PhoneAuthProvider(auth);
  firestore = getFirestore(app);
  realtimeDb = getDatabase(app);

  console.log('Firebase services ready');
} catch (error: any) {
  console.error('Firebase initialization error:', error);
  initializationError = error.message;
}

// Export with fallback
export const getFirebaseApp = () => {
  if (!app && !initializationError) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

export { app, auth, firestore, realtimeDb, phoneAuthProvider };
export type { ConfirmationResult, User };
export { firebaseOnAuthStateChanged as onAuthStateChanged };