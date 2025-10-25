'use client';

import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';
import { useEffect, useState } from 'react';
import FirebaseErrorListener from '@/components/firebase-error-listener';

// This component is responsible for initializing Firebase on the client side.
// It should be used as a wrapper around the root layout of your application.
export default function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { firebaseApp, firestore, auth } = initializeFirebase();

  if (!isMounted || !auth || !firestore) {
    // On the server or before hydration, don't render children that might depend on Firebase
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
