
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
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
        // Set persistence to LOCAL to keep the user logged in across sessions
        setPersistence(auth, browserLocalPersistence)
          .catch((error) => {
            console.error("Error setting auth persistence:", error);
          });
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
