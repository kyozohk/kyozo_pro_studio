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
import { useRouter } from 'next/navigation';

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isSigningIn, setIsSigningIn] = useState(true);
  const router = useRouter();

  const onSignInSuccess = () => {
    onOpenChange(false);
    router.push('/dashboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-4xl bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 flex flex-col">
            <h2 className="text-2xl font-bold font-headline">
              {isSigningIn ? 'Welcome back' : 'Welcome to Kyozo'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isSigningIn
                ? 'Sign in to access your community dashboard.'
                : 'Create an account or sign in to access your community dashboard and settings.'}
            </p>

            <div className="flex-1 flex flex-col justify-center py-8">
                {isSigningIn ? <SignInForm /> : <SignUpForm />}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
              </div>
              <Button variant="outline" className="w-full" onClick={() => handleGoogleSignIn(onSignInSuccess)}>
                <GoogleIcon className="mr-2" />
                Continue with Google
              </Button>
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
              src="/form-right.mp4"
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
