'use client';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});

// Set the branding for the sign-in pop-up
provider.setCustomParameters({
  'login_hint': 'user@example.com',
  'hd': 'example.com', // Optionally, restrict to a G Suite domain
});

export function handleSignIn() {
  const auth = getAuth();
  auth.tenantId = firebaseConfig.authDomain;
  signInWithPopup(auth, provider)
    .then(result => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log({ credential, token, user });
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

// Helper to get the firebase config
const firebaseConfig = {
  apiKey: "AIzaSyALpnr-pNEyAQUgYBgVwfDIguJ_lu7_KQY",
  authDomain: "kyozo-prod.firebaseapp.com",
  projectId: "kyozo-prod",
  storageBucket: "kyozo-prod.appspot.com",
  messagingSenderId: "480316724826",
  appId: "1:480316724826:web:152538c6412b7a97c23f13",
  measurementId: "G-93V44B5N0G"
};