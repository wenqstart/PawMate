import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, PhoneAuthProvider, signInWithCredential, ConfirmationResult, User, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './config';

// Initialize Firebase
let app: FirebaseApp;
let auth: any;
let firestore: any;
let realtimeDb: any;
let phoneAuthProvider: any;

try {
  // Prevent re-initialization in dev hot reload
  if (getApps().length === 0) {
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

  console.log('Auth service:', auth ? 'available' : 'NOT available');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export services
export { app, auth, phoneAuthProvider, firestore, realtimeDb };
export type { ConfirmationResult, User };

// Re-export onAuthStateChanged directly from firebase/auth
export { firebaseOnAuthStateChanged as onAuthStateChanged };