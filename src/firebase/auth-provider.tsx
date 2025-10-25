'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  AuthError,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import type { SignUpInput, SignInInput } from "@/lib/types";


type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (data: SignInInput) => Promise<void>;
  signUp: (data: SignUpInput) => Promise<void>;
  signInWithGoogle: (callback?: () => void) => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (data: SignInInput) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      const authError = error as AuthError;
      console.error("Error signing in:", authError);
      setAuthError(authError.message || "Failed to sign in");
      throw error;
    }
  };

  const signInWithGoogle = async (callback?: () => void) => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      if (callback) callback();
    } catch (error) {
      const authError = error as AuthError;
      console.error("Error signing in with Google:", authError);
      
      let errorMessage = "Failed to sign in with Google";
      
      if (authError.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was closed before completing the sign in.";
      } else if (authError.code === 'auth/popup-blocked') {
        errorMessage = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (authError.code === 'auth/cancelled-popup-request') {
        errorMessage = "Multiple popup requests were triggered. Only one popup can be opened at a time.";
      } else if (authError.code === 'auth/invalid-credential') {
        errorMessage = "The authentication credential is invalid. Please try again or use a different sign-in method.";
      } else if (authError.message) {
        errorMessage = authError.message;
      }
      
      setAuthError(errorMessage);
      throw error;
    }
  };

  const signUp = async (data: SignUpInput) => {
    setAuthError(null);
    const {firstName, lastName, email, password} = data;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = `${firstName} ${lastName}`;
        await updateProfile(userCredential.user, { displayName });
    } catch (error) {
        const authError = error as AuthError;
        console.error("Error creating user:", authError);
        setAuthError(authError.message || "Failed to create account");
        throw error;
    }
  };

  const signOut = async () => {
    setAuthError(null);
    console.log('Sign out function called');
    try {
      await firebaseSignOut(auth);
      console.log('Sign out successful, redirecting');
      // Redirect to home page after successful sign out
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      const authError = error as AuthError;
      console.error("Error signing out:", authError);
      setAuthError(authError.message || "Failed to sign out");
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
