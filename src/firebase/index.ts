import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import {
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';
import { useUser } from './auth/use-user';

let firebaseApp: FirebaseApp;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

// This function is idempotent, so it can be called multiple times.
function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  // Only initialize auth and firestore on the client
  if (typeof window !== 'undefined') {
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } else {
    // For server-side rendering, we might not need auth, but firestore can be useful.
    // Ensure we don't re-initialize it if it already exists.
    try {
      firestore = getFirestore(firebaseApp);
    } catch (e) {
      firestore = getFirestore();
    }
  }
  
  return { firebaseApp, auth, firestore };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
};
