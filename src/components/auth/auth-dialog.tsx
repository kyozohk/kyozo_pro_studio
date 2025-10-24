import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { GoogleIcon } from './google-icon';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import SignUpForm from './sign-up-form';
import SignInForm from './sign-in-form';
import { useState } from 'react';
import { handleGoogleSignIn } from '@/firebase/auth/client';

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isSigningIn, setIsSigningIn] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 flex flex-col">
            <h2 className="text-2xl font-bold font-headline">
              {isSigningIn ? 'Welcome back' : 'Welcome to Kyozo'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isSigningIn
                ? 'Sign in to access your community dashboard.'
                : 'Create an account to get started.'}
            </p>

            <div className="flex-1 flex flex-col justify-center">
                {isSigningIn ? <SignInForm /> : <SignUpForm />}
            </div>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              {isSigningIn
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                onClick={() => setIsSigningIn(!isSigningIn)}
                className="text-primary font-semibold hover:underline"
              >
                {isSigningIn ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
          <div className="hidden md:block relative">
            <video
              src="/mushrooms.mp4"
              autoPlay
              muted
              loop
              className="absolute inset-0 w-full h-full object-cover rounded-r-lg"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
