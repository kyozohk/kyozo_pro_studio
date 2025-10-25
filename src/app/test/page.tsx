'use client';

import { useState, useTransition } from 'react';
import { useAuth } from '@/firebase/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  getFirestore,
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { useToast } from '@/hooks/use-toast';
import SignInForm from '@/components/auth/sign-in-form';

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const db = getFirestore(app);

export default function TestPage() {
  const { user, loading: userLoading, signInWithGoogle, signOut } = useAuth();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [message, setMessage] = useState('');

  const handleCreateCommunity = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to create a community.',
      });
      return;
    }

    startTransition(async () => {
      setMessage('');
      const tenantId = user.uid;
      const newCommunityRef = doc(
        collection(db, `tenants/${tenantId}/communities`)
      );
      const communityId = newCommunityRef.id;

      const communityData = {
        communityId: communityId,
        name: `Test Community ${Math.floor(Math.random() * 1000)}`,
        description: 'This is a test community created from the /test page.',
        visibility: 'public',
        profile: { logoUrl: '', bannerUrl: '' },
        createdBy: tenantId,
        memberCount: 1,
        createdAt: serverTimestamp(),
      };

      const tenantRef = doc(db, `tenants/${tenantId}`);
      const membershipRef = doc(
        db,
        `tenants/${tenantId}/communities/${communityId}/memberships/${tenantId}`
      );
      const userRef = doc(db, `users/${user.uid}`);

      try {
        const batch = writeBatch(db);

        // 1. Set Tenant Info
        const tenantPayload = {
          tenantId: tenantId,
          name: `${user.displayName}'s Organization`,
          email: user.email,
          subscription: { plan: 'free', status: 'active' },
        };
        batch.set(tenantRef, tenantPayload, { merge: true });

        // 2. Set Community Info
        batch.set(newCommunityRef, communityData);

        // 3. Set Membership for Owner
        const membershipPayload = {
          memberId: tenantId,
          role: 'admin',
          status: 'active',
          joinDate: serverTimestamp(),
        };
        batch.set(membershipRef, membershipPayload);

        // 4. Update user's tenants array
        // Check if user doc exists, if not, create it.
        batch.set(userRef, { tenants: arrayUnion(tenantId) }, { merge: true });

        await batch.commit();

        setMessage(`Successfully created community with ID: ${communityId}`);
        toast({
          title: 'Success!',
          description: `Successfully created community with ID: ${communityId}`,
        });
      } catch (error: any) {
        console.error('Error creating community:', error);
        setMessage(`Error creating community: ${error.message}`);
        toast({
          variant: 'destructive',
          title: 'Error creating community',
          description: error.message,
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Community Creation Test</CardTitle>
          <CardDescription>
            Use this page to test the multi-tenant community creation
            functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {userLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className='text-center'>
                <p>
                  Welcome,{' '}
                  <span className="font-semibold">{user.displayName}</span>!
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <div className="rounded-md bg-muted p-4 text-xs font-mono overflow-auto">
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button onClick={handleCreateCommunity} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Test Community
                </Button>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                You are not logged in. Please sign in to test.
              </p>
              <SignInForm />
              <div className="flex items-center gap-2">
                <div className="flex-1 border-b"></div>
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 border-b"></div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => signInWithGoogle()}
              >
                Sign In with Google
              </Button>
            </div>
          )}
          {message && (
            <div
              className={`p-4 rounded-md text-sm ${
                message.includes('Error')
                  ? 'bg-destructive/20 text-destructive-foreground'
                  : 'bg-primary/20 text-primary-foreground'
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
