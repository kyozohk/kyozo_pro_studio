'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { oldFirebaseConfig } from '@/firebase/old-config';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import CommunityList from './community-list';
import MemberList from './member-list';
import MessageList from './message-list';

let oldApp: FirebaseApp;
if (getApps().every(app => app.name !== 'oldDB')) {
  oldApp = initializeApp(oldFirebaseConfig, 'oldDB');
} else {
  oldApp = getApp('oldDB');
}
const oldFirestore = getFirestore(oldApp);

export default function MigratePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const handleSelectCommunity = (communityId: string) => {
    setSelectedCommunityId(communityId);
    setSelectedMemberId(null); // Reset member selection when community changes
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
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
            <div className="max-w-6xl mx-auto text-center mb-12">
                <h1 className="font-headline text-4xl font-bold">Database Migration Explorer</h1>
                <p className="mt-4 text-muted-foreground">
                    Select a community to see its members, then select a member to see their messages from <code className="bg-muted px-2 py-1 rounded-md font-mono text-sm">kyozo-pro-webflow-fb6cc</code>.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh] max-w-7xl mx-auto">
                <CommunityList 
                    firestore={oldFirestore} 
                    onSelectCommunity={handleSelectCommunity} 
                    selectedCommunityId={selectedCommunityId}
                />
                <MemberList 
                    firestore={oldFirestore}
                    communityId={selectedCommunityId}
                    onSelectMember={handleSelectMember}
                    selectedMemberId={selectedMemberId}
                />
                <MessageList 
                    firestore={oldFirestore}
                    communityId={selectedCommunityId}
                    memberId={selectedMemberId}
                />
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
