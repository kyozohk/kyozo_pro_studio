'use client';

import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, Loader2, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState, useTransition } from 'react';
import AddCommunityDialog from './add-community-dialog';
import CommunityCard from './community-card';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

export default function CommunityList() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { data, loading, addCommunity } = useDashboardData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleTestCreate = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a community.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const batch = writeBatch(firestore);
        const tenantId = user.uid;

        const tenantRef = doc(firestore, 'tenants', tenantId);
        batch.set(
          tenantRef,
          {
            tenantId: tenantId,
            name: `${user.displayName}'s Organization`,
            email: user.email,
            subscription: { plan: 'free', status: 'active' },
          },
          { merge: true }
        );

        const communityRef = doc(
          collection(firestore, 'tenants', tenantId, 'communities')
        );
        const newCommunityData = {
          communityId: communityRef.id,
          name: `Test Community ${Math.floor(Math.random() * 1000)}`,
          description:
            'This is a test community created with a simple button click.',
          visibility: 'public',
          createdBy: tenantId,
          memberCount: 1,
          profile: {
            logoUrl: '',
            bannerUrl: '',
          },
          createdAt: serverTimestamp(),
        };
        batch.set(communityRef, newCommunityData);

        const membershipRef = doc(
          collection(communityRef, 'memberships'),
          user.uid
        );
        batch.set(membershipRef, {
          memberId: user.uid,
          role: 'admin',
          status: 'active',
          joinDate: serverTimestamp(),
        });

        const userRef = doc(firestore, 'users', user.uid);
        batch.update(userRef, {
          tenants: [tenantId],
        });

        await batch.commit();

        toast({
          title: 'Test Community Created',
          description: 'Successfully created test community!',
        });
        addCommunity({ id: communityRef.id, ...newCommunityData });
      } catch (error: any) {
        console.error('Error creating community:', error);
        toast({
          variant: 'destructive',
          title: 'Error creating community',
          description: error.message,
        });
      }
    });
  };

  const handleSuccess = (newCommunity: any) => {
    addCommunity(newCommunity);
    setIsAddDialogOpen(false);
  };
  
  if (userLoading || loading) {
    return (
        <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading communities...</p>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="text-center py-10 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <p className="text-muted-foreground">Please sign in to view and create communities.</p>
        </div>
    )
  }
  
  const communities = data.communities || [];

  return (
    <>
      <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-headline font-bold">Your Communities</h2>
            <div className='flex items-center gap-2'>
                <Button onClick={handleTestCreate} variant="outline" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                     Create Test Community
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Community
                </Button>
            </div>
          </div>
          {communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map(community => (
                  <CommunityCard key={community.id} community={community} />
              ))}
              </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <p className="text-muted-foreground">You haven't created any communities yet.</p>
              <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>Create your first one</Button>
            </div>
          )}
      </div>
      <AddCommunityDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
