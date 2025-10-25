'use client';

import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, Loader2, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import AddCommunityDialog from './add-community-dialog';

export default function CommunityList() {
  const { data, loading, addCommunity } = useDashboardData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  if (loading) {
    return (
        <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading communities...</p>
        </div>
    );
  }
  
  const communities = data.communities || [];

  const handleSuccess = (newCommunity: any) => {
    addCommunity(newCommunity);
    setIsAddDialogOpen(false);
  }

  return (
    <>
      <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-headline font-bold">Your Communities</h2>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Community
            </Button>
          </div>
          {communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map(community => (
                  <Card key={community.id} className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                      <CardHeader className="p-0">
                          <div className="relative h-40 w-full">
                              <Image 
                                  src={community.profile?.bannerUrl || `https://picsum.photos/seed/${community.id}/600/400`}
                                  alt={community.name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  className="bg-muted"
                              />
                          </div>
                          <div className="p-4">
                              <CardTitle className="text-xl font-headline">{community.name}</CardTitle>
                              <CardDescription className="mt-1 line-clamp-2 h-10">{community.description}</CardDescription>
                          </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <span>{community.memberCount || 0} members</span>
                              <Button variant="ghost" size="sm">
                                  View <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                          </div>
                      </CardContent>
                  </Card>
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
