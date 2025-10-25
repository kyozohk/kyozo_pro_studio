'use client';

import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, Loader2, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState, useTransition } from 'react';
import AddCommunityDialog from './add-community-dialog';
import CommunityCard from './community-card';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createCommunity } from '@/app/actions';

export default function CommunityList() {
  const { user, loading: userLoading } = useUser();
  const { data, loading, addCommunity } = useDashboardData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleTestCreate = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a community.',
      });
      return;
    }

    startTransition(async () => {
        const communityData = {
          name: `Test Community ${Math.floor(Math.random() * 1000)}`,
          description:
            'This is a test community created with a simple button click.',
          visibility: 'public',
          profile: {
            logoUrl: '',
            bannerUrl: '',
          },
        };
        const result = await createCommunity(communityData, user.uid, user.email!, user.displayName!);
        if (result.success) {
            toast({
              title: 'Test Community Created',
              description: 'Successfully created test community!',
            });
            addCommunity(result.data);
        } else {
            toast({
              variant: 'destructive',
              title: 'Error creating community',
              description: result.message,
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
