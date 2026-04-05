// Firebase auth functions - uses firebase/auth SDK directly
import { app, firestore, realtimeDb, auth as firebaseAuth } from './index';
import {
  signInWithPhoneNumber,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  PhoneAuthProvider,
  EmailAuthProvider,
  User,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { ref, set, push, onValue, off } from 'firebase/database';

// Get fresh auth instance
export const getAuthInstance = () => firebaseAuth;

// Types
export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  nickname: string;
  avatar: string;
  createdAt: any;
  updatedAt: any;
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  gender: 'male' | 'female';
  birthday: string;
  avatar?: string;
  photos: string[];
  personality: string[];
  bio: string;
  lookingFor: string;
  ownerId: string;
  ownerName?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Match {
  id: string;
  users: string[];
  pets: [string, string];
  petDetails?: [Pet, Pet];
  status: 'matched' | 'unmatched';
  createdAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: any;
}

// Auth state listener
export const onAuthChange = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(firebaseAuth, callback);
};

// Get current user
export const getCurrentUser = () => {
  const authInstance = getAuthInstance();
  return authInstance.currentUser;
};

// Send verification code
export const sendVerificationCode = async (phoneNumber: string) => {
  const authInstance = getAuthInstance();
  const confirmation = await signInWithPhoneNumber(authInstance, phoneNumber);
  return confirmation;
};

// Verify code and sign in
export const verifyCode = async (verificationId: string, code: string): Promise<User> => {
  const authInstance = getAuthInstance();
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const result = await signInWithCredential(authInstance, credential);
  return result.user;
};

// Sign out
export const signOut = async () => {
  const authInstance = getAuthInstance();
  await authInstance.signOut();
};

// Create or update user profile
export const createUserProfile = async (
  uid: string,
  email: string,
  nickname: string,
  avatar: string = '',
  phoneNumber: string = ''
): Promise<void> => {
  const userRef = doc(firestore, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      email,
      phoneNumber,
      nickname,
      avatar,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      nickname,
      avatar,
      updatedAt: serverTimestamp(),
    });
  }
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(firestore, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return { uid, ...userDoc.data() } as UserProfile;
  }
  return null;
};

// Add pet
export const addPet = async (pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const petsRef = collection(firestore, 'users', pet.ownerId, 'pets');
  const petRef = doc(petsRef);
  const petId = petRef.id;

  await setDoc(petRef, {
    ...pet,
    id: petId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return petId;
};

// Update pet
export const updatePet = async (ownerId: string, petId: string, updates: Partial<Pet>): Promise<void> => {
  const petRef = doc(firestore, 'users', ownerId, 'pets', petId);
  await updateDoc(petRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete pet (soft delete)
export const deletePet = async (ownerId: string, petId: string): Promise<void> => {
  const petRef = doc(firestore, 'users', ownerId, 'pets', petId);
  await updateDoc(petRef, { deletedAt: serverTimestamp() });
};

// Get user's pets
export const getUserPets = async (ownerId: string): Promise<Pet[]> => {
  const petsRef = collection(firestore, 'users', ownerId, 'pets');
  const snapshot = await getDocs(petsRef);

  const pets: Pet[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.deletedAt) {
      pets.push({ ...data } as Pet);
    }
  });

  return pets;
};

// Get all pets (for browsing, excluding current user's pets)
export const getAllPets = async (excludeUserId: string): Promise<Pet[]> => {
  const pets: Pet[] = [];

  // Get all users
  const usersRef = collection(firestore, 'users');
  const usersSnapshot = await getDocs(usersRef);

  for (const userDoc of usersSnapshot.docs) {
    if (userDoc.id === excludeUserId) continue;

    const petsRef = collection(firestore, 'users', userDoc.id, 'pets');
    const petsSnapshot = await getDocs(petsRef);

    for (const petDoc of petsSnapshot.docs) {
      const data = petDoc.data();
      if (!data.deletedAt) {
        pets.push({
          ...data,
          ownerId: userDoc.id,
        } as Pet);
      }
    }
  }

  return pets;
};

// Get pet by ID (with owner info)
export const getPetById = async (petId: string): Promise<Pet | null> => {
  const usersRef = collection(firestore, 'users');
  const usersSnapshot = await getDocs(usersRef);

  for (const userDoc of usersSnapshot.docs) {
    const petRef = doc(firestore, 'users', userDoc.id, 'pets', petId);
    const petDoc = await getDoc(petRef);

    if (petDoc.exists()) {
      const data = petDoc.data();
      return { ...data, ownerId: userDoc.id } as Pet;
    }
  }

  return null;
};

// Like a pet (create match request)
export const likePet = async (
  likerId: string,
  likerPetId: string,
  likedPetId: string,
  message: string
): Promise<{ matched: boolean; matchId?: string }> => {
  const matchesRef = collection(firestore, 'matches');

  // Check if other user already liked us
  const q = query(matchesRef, where('pets', '==', [likedPetId, likerPetId].sort()));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const existingMatch = snapshot.docs[0].data();
    await updateDoc(doc(firestore, 'matches', existingMatch.id), {
      users: [likerId, existingMatch.users[0]],
      status: 'matched',
      updatedAt: serverTimestamp(),
    });
    return { matched: true, matchId: existingMatch.id };
  } else {
    const matchRef = doc(matchesRef);
    await setDoc(matchRef, {
      id: matchRef.id,
      users: [likerId],
      pets: [likerPetId, likedPetId].sort(),
      likerPetId,
      likedPetId,
      message,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { matched: false };
  }
};

// Get matches for user
export const getUserMatches = async (userId: string): Promise<Match[]> => {
  const matchesRef = collection(firestore, 'matches');
  // Query only by user, sort in client to avoid composite index
  const q = query(matchesRef, where('users', 'array-contains', userId));

  const snapshot = await getDocs(q);
  const matches: Match[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.status === 'matched') {
      const petA = await getPetById(data.pets[0]);
      const petB = await getPetById(data.pets[1]);

      matches.push({
        id: docSnap.id,
        users: data.users,
        pets: data.pets,
        petDetails: petA && petB ? [petA, petB] : undefined,
        status: data.status,
        createdAt: data.createdAt,
      });
    }
  }

  // Sort by createdAt in descending order
  matches.sort((a, b) => {
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;
    return timeB - timeA;
  });

  return matches;
};

// Send message
export const sendMessage = async (matchId: string, senderId: string, senderName: string, content: string): Promise<void> => {
  const messagesRef = ref(realtimeDb, `matches/${matchId}/messages`);
  const newMessageRef = push(messagesRef);

  await set(newMessageRef, {
    senderId,
    senderName,
    content,
    timestamp: Date.now(),
  });
};

// Subscribe to messages
export const subscribeToMessages = (matchId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = ref(realtimeDb, `matches/${matchId}/messages`);

  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((child) => {
      messages.push({ id: child.key!, ...child.val() });
    });
    messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    callback(messages);
  });

  return () => off(messagesRef);
};

// Verify code with confirmation result
export const verifyCodeWithConfirmation = async (
  confirmationResult: any,
  code: string
): Promise<User> => {
  const authInstance = getAuthInstance();
  const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, code);
  const result = await signInWithCredential(authInstance, credential);
  return result.user;
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const authInstance = getAuthInstance();
  const result = await signInWithEmailAndPassword(authInstance, email, password);
  return result.user;
};

// Register with email and password
export const registerWithEmail = async (email: string, password: string): Promise<User> => {
  const authInstance = getAuthInstance();
  const result = await createUserWithEmailAndPassword(authInstance, email, password);
  return result.user;
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  const authInstance = getAuthInstance();
  await sendPasswordResetEmail(authInstance, email);
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(firestore, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};