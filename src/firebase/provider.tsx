'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  firestore: null,
  auth: null,
});

export const FirebaseProvider: React.FC<{
  children: React.ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}> = ({ children, firebaseApp, firestore, auth }) => {
  const contextValue = useMemo(
    () => ({
      firebaseApp,
      firestore,
      auth,
    }),
    [firebaseApp, firestore, auth]
  );
  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function useFirebaseApp() {
  return useContext(FirebaseContext).firebaseApp;
}

export function useFirestore() {
  return useContext(FirebaseContext).firestore;
}

export function useAuth() {
  return useContext(FirebaseContext).auth;
}

export function useMemoFirebase<T>(
  factory: () => T | null,
  deps: React.DependencyList
): T | null {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);

  const [resolvedValue, setResolvedValue] = useState<T | null>(value);

  useEffect(() => {
    setResolvedValue(value);
  }, [value]);

  return resolvedValue;
}
