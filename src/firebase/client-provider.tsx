'use client';

import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// This component is responsible for initializing Firebase on the client side.
// It should be used as a wrapper around the root layout of your application.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseApp, firestore, auth } = initializeFirebase();

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
}
