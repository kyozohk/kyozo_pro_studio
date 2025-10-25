'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * A client component that listens for specific application-wide events
 * and throws them as errors to be caught by Next.js's error boundary.
 * This is primarily used to display detailed Firestore permission errors
 * in the development overlay.
 */
export default function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: Error) => {
      // Throwing the error here will cause it to be picked up by
      // the Next.js development error overlay.
      // In production, it would be caught by the nearest `error.js`
      // boundary.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, []);

  // This component does not render anything
  return null;
}
