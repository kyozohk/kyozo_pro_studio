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
  const { user } = useUser();
  const firestore = useFirestore();
  const { data, loading, addCommunity } = useDashboardData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  if (loading) {
    return (
        <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading communities...</p>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground">Please sign in to see your communities.</p>
        </div>
    )
  }
  
  const communities = data.communities || [];

  const handleSuccess = (newCommunity: any) => {
    addCommunity(newCommunity);
    setIsAddDialogOpen(false);
  }
  
  const handleTestCreate = async () => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    
    startTransition(async () => {
      try {
        const batch = writeBatch(firestore);
        const tenantId = user.uid; // Use user ID as tenant ID

        // 1. Check if tenant exists, if not, create it
        const tenantRef = doc(firestore, 'tenants', tenantId);
        // In a real app, you might getDoc and check existence first
        // For this simplified version, we'll just set it with merge to be safe
        batch.set(tenantRef, {
            tenantId: tenantId,
            name: `${user.displayName}'s Organization`,
            email: user.email,
            subscription: { plan: 'free', status: 'active' }
        }, { merge: true });
        
        // 2. Create the new community
        const communityRef = doc(collection(firestore, 'tenants', tenantId, 'communities'));
        const newCommunityData = {
            communityId: communityRef.id,
            name: `Test Community ${Math.floor(Math.random() * 1000)}`,
            description: 'This is a test community created with a simple button click.',
            visibility: 'public',
            createdBy: tenantId,
            memberCount: 1,
            profile: {
                logoUrl: '',
                bannerUrl: ''
            },
            createdAt: serverTimestamp()
        };
        batch.set(communityRef, newCommunityData);
        
        // 3. Add the creator as a member of the community
        const membershipRef = doc(collection(communityRef, 'memberships'), user.uid);
        batch.set(membershipRef, {
            memberId: user.uid,
            role: 'admin',
            status: 'active',
            joinDate: serverTimestamp()
        });

        // 4. Update the user's tenants list
        const userRef = doc(firestore, 'users', user.uid);
        batch.update(userRef, {
            tenants: [tenantId] // This will overwrite, for arrayUnion-like behavior, read and then write.
        });

        await batch.commit();

        toast({ title: 'Test Community Created', description: 'Successfully created test community!' });
        addCommunity({ id: communityRef.id, ...newCommunityData });

      } catch (error: any) {
          console.error("Error creating community:", error);
          toast({ variant: 'destructive', title: 'Error creating community', description: error.message });
      }
    });
  }


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
