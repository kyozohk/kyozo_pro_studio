'use client';

import { useEffect, useState, useTransition } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, type DocumentData } from 'firebase/firestore';
import { oldFirebaseConfig } from '@/firebase/old-config';
import { Loader2, UploadCloud } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import CommunityList from './community-list';
import MemberList from './member-list';
import MessageList from './message-list';
import { Button } from '@/components/ui/button';
import { exportCommunity } from '../actions';
import { useToast } from '@/hooks/use-toast';
import CommunityDetails from './community-details';
import MemberDetails from './member-details';

let oldApp: FirebaseApp;
if (!getApps().some(app => app.name === 'oldDB')) {
  oldApp = initializeApp(oldFirebaseConfig, 'oldDB');
} else {
  oldApp = getApp('oldDB');
}
const oldFirestore = getFirestore(oldApp);

export default function MigratePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [selectedCommunity, setSelectedCommunity] = useState<DocumentData | null>(null);
  const [selectedMember, setSelectedMember] = useState<DocumentData | null>(null);
  const [communityMembers, setCommunityMembers] = useState<DocumentData[]>([]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const handleSelectCommunity = (communityData: DocumentData) => {
    setSelectedCommunity(communityData);
    setSelectedMember(null);
  };

  const handleSelectMember = (memberData: DocumentData) => {
    setSelectedMember(memberData);
  };
  
  const handleExport = () => {
    if (!selectedCommunity) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a community to export.' });
        return;
    }
    startTransition(async () => {
        const result = await exportCommunity(selectedCommunity, communityMembers);
        if (result.success) {
            toast({ title: 'Export Successful', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Export Failed', description: result.message });
        }
    });
  };

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-10 md:py-16">
            <div className="max-w-6xl mx-auto text-center mb-6">
                <h1 className="font-headline text-4xl font-bold">Database Migration Explorer</h1>
                <p className="mt-4 text-muted-foreground">
                    Select a community to see its members, then select a member to see their messages from <code className="bg-muted px-2 py-1 rounded-md font-mono text-sm">kyozo-pro-webflow-fb6cc</code>.
                </p>
            </div>
            <div className="max-w-7xl mx-auto mb-6 text-center">
                 <Button onClick={handleExport} disabled={!selectedCommunity || isPending}>
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <UploadCloud className="mr-2 h-4 w-4" />
                    )}
                    Export to New Schema
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh] max-w-7xl mx-auto">
                <CommunityList 
                    firestore={oldFirestore} 
                    onSelectCommunity={handleSelectCommunity} 
                    selectedCommunityId={selectedCommunity?.id || null}
                />
                <MemberList 
                    firestore={oldFirestore}
                    community={selectedCommunity}
                    onSelectMember={handleSelectMember}
                    selectedMemberId={selectedMember?.id || null}
                    onMembersLoaded={setCommunityMembers}
                />
                <MessageList 
                    firestore={oldFirestore}
                    communityId={selectedCommunity?.id || null}
                    memberId={selectedMember?.id || null}
                />
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
