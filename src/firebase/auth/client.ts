'use client';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import type {Auth} from 'firebase/auth';
import { firebaseConfig } from '../config';
import type { SignUpInput, SignInInput } from '@/lib/types';
import { useUser } from './use-user';


const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account',
});


export function handleGoogleSignIn(callback?: () => void) {
  const auth = getAuth();
  signInWithPopup(auth, provider)
    .then(result => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log({ credential, token, user });
      if (callback) {
        callback();
      }
    })
    .catch(error => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData?.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error({ errorCode, errorMessage, email, credential });
    });
}

export function handleSignOut() {
  const auth = getAuth();
  signOut(auth);
}

export async function handleSignUp(data: SignUpInput) {
    const auth = getAuth();
    const {firstName, lastName, email, password} = data;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const displayName = `${firstName} ${lastName}`;
    await updateProfile(userCredential.user, { displayName });
    return userCredential;
}

export async function handleSignIn(data: SignInInput) {
    const auth = getAuth();
    const {email, password} = data;
    return signInWithEmailAndPassword(auth, email, password);
}
