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
  isLooking: boolean; // 是否在征婚
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

// Get all pets (for browsing, excluding current user's pets, only show pets that are looking for partner)
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
      // Only show pets that are looking for a partner
      if (!data.deletedAt && data.isLooking === true) {
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
  console.log('likePet called:', { likerId, likerPetId, likedPetId, message });
  const matchesRef = collection(firestore, 'matches');

  // Check if other user already liked us
  const q = query(matchesRef, where('pets', '==', [likedPetId, likerPetId].sort()));
  const snapshot = await getDocs(q);
  console.log('Existing matches found:', snapshot.empty ? 0 : snapshot.docs.length);

  if (!snapshot.empty) {
    const existingMatch = snapshot.docs[0].data();
    console.log('Matching with existing match:', existingMatch.id);
    await updateDoc(doc(firestore, 'matches', existingMatch.id), {
      users: [likerId, existingMatch.users[0]],
      status: 'matched',
      updatedAt: serverTimestamp(),
    });
    return { matched: true, matchId: existingMatch.id };
  } else {
    const matchRef = doc(matchesRef);
    console.log('Creating new pending like');
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

// Get pending likes (requests sent to user's pets)
export const getPendingLikes = async (userId: string): Promise<any[]> => {
  console.log('=== getPendingLikes ===');
  console.log('userId:', userId);

  const pets = await getUserPets(userId);
  console.log('User pets count:', pets.length);

  if (pets.length === 0) {
    console.log('No pets found for user');
    return [];
  }

  const petIds = pets.map(p => p.id);
  console.log('User pet IDs:', petIds);

  const matchesRef = collection(firestore, 'matches');
  const pendingLikes: any[] = [];

  // Get ALL matches to debug
  const snapshot = await getDocs(matchesRef);
  console.log('Total matches in DB:', snapshot.docs.length);

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    console.log('  Match:', docSnap.id);
    console.log('    status:', data.status);
    console.log('    pets:', data.pets);
    console.log('    users:', data.users);

    // Check if any of user's pets is in this match's pets array
    const isLikedPet = petIds.includes(data.pets[0]) || petIds.includes(data.pets[1]);
    console.log('    hasUserPet:', isLikedPet);

    // Only show pending likes (where user didn't respond yet)
    // Pending = other user liked my pet, I haven't accepted or pass yet
    console.log('    -> isLikedPet:', isLikedPet, 'status:', data.status);
    if (isLikedPet && data.status === 'pending') {
      console.log('    -> PENDING LIKE! This is a like for user\'s pet');

      const likedPetId = petIds.includes(data.pets[0]) ? data.pets[0] : data.pets[1];
      const likedPet = pets.find(p => p.id === likedPetId);

      const likerPetId = data.pets[0] === likedPetId ? data.pets[1] : data.pets[0];
      console.log('    likedPetId:', likedPetId, 'likerPetId:', likerPetId);

      const likerPet = await getPetById(likerPetId);
      console.log('    likerPet:', likerPet);

      // Determine the other user (not current user)
      const otherUserId = data.users.find((u: string) => u !== userId);

      pendingLikes.push({
        id: docSnap.id,
        likedPet,
        likerPet,
        message: data.message,
        createdAt: data.createdAt,
        status: data.status,
        otherUserId,
      });
    }
  }

  console.log('Total likes found:', pendingLikes.length);
  return pendingLikes;
};

// Send message
export const sendMessage = async (matchId: string, senderId: string, senderName: string, content: string): Promise<void> => {
  console.log('sendMessage called:', { matchId, senderId, senderName, content });
  const messagesRef = ref(realtimeDb, `matches/${matchId}/messages`);
  const newMessageRef = push(messagesRef);

  await set(newMessageRef, {
    senderId,
    senderName,
    content,
    timestamp: Date.now(),
  });
  console.log('Message sent successfully');
};

// Subscribe to messages
export const subscribeToMessages = (matchId: string, callback: (messages: Message[]) => void) => {
  console.log('subscribeToMessages called for match:', matchId);
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