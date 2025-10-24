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
let auth: Auth | null = null;
let firestore: Firestore | null = null;

// This function is idempotent, so it can be called multiple times.
function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  // Only initialize auth and firestore on the client
  if (typeof window !== 'undefined') {
    if (!auth) {
        auth = getAuth(firebaseApp);
    }
    if (!firestore) {
        firestore = getFirestore(firebaseApp);
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
