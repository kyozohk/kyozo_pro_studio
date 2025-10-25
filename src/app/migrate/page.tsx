'use client';

import { useEffect, useState, useTransition } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, type DocumentData } from 'firebase/firestore';
import { oldFirebaseConfig } from '@/firebase/old-config';
import { Loader2, Download, Home, Users, Settings, Database, LayoutGrid, Search, LogOut, ShieldCheck } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import CommunityList from './community-list';
import MemberList from './member-list';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MemberDetails from './member-details';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarInput,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/landing/logo';
import { handleSignOut } from '@/firebase/auth/client';
import ExportPreviewDialog from './export-preview-dialog';
import { createCommunity } from '@/app/actions';

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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [exportData, setExportData] = useState<object | null>(null);


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

  const downloadJson = (data: any, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleExport = () => {
    if (!selectedCommunity) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a community to export.' });
        return;
    }
    
    // This is for JSON download
    downloadJson(selectedCommunity, `${selectedCommunity.id}-community.json`);
    downloadJson(communityMembers, `${selectedCommunity.id}-members.json`);
    toast({ title: 'Export Started', description: 'Your JSON files are being downloaded.' });
  };
  
  const handleExportToNewSchema = () => {
    if (!selectedCommunity || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a community to export.' });
      return;
    }
    const transformedCommunity = {
      // Basic Info
      communityId: selectedCommunity.id,
      name: selectedCommunity.name,
      description: selectedCommunity.lore,
      profile: {
        logoUrl: selectedCommunity.communityProfileImage,
        bannerUrl: selectedCommunity.communityBackgroundImage,
      },
      visibility: selectedCommunity.communityPrivacy || 'private',
      createdBy: user.uid, // tenantId will be owner
      
      // We will derive this on the new side, but for preview we can show it
      memberCount: communityMembers.length,
    };
    
    setExportData({ community: transformedCommunity, members: communityMembers });
    setIsPreviewOpen(true);
  }

  const confirmExport = () => {
    if (!exportData || !user) return;

    startTransition(async () => {
        const result = await createCommunity((exportData as any).community, user.uid);
        if (result.success) {
            toast({ title: 'Export Successful', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Export Failed', description: result.message });
        }
        setIsPreviewOpen(false);
    });
  }


  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    return names
      .map(n => n[0])
      .join('')
      .toUpperCase();
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
    <>
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="border-b">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="group-[[data-state=expanded]]/sidebar-wrapper:opacity-100 group-[[data-state=collapsed]]/sidebar-wrapper:opacity-0 transition-opacity duration-200">
              <Logo />
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2">
            <SidebarInput icon={<Search />} placeholder="Search..." />
          </div>
          <SidebarMenu className="p-2">
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" icon={<Home />}>
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/communities" icon={<LayoutGrid />}>
                Communities
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/moderation" icon={<ShieldCheck />}>
                Moderation
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/migrate" isActive icon={<Database />}>
                Migrate
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" icon={<Settings />}>
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarSeparator />
            <SidebarMenu className="p-2">
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleSignOut()} icon={<LogOut />}>
                        Log Out
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex flex-col flex-1 h-screen">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex-1">
              <h1 className="font-headline text-xl font-bold">Database Migration Tool</h1>
              <p className="text-sm text-muted-foreground">
                  Select a community to see its members, then export the data.
              </p>
            </div>
            <div className="flex items-center gap-4">
                 <Button onClick={handleExport} disabled={!selectedCommunity} size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export to JSON
                </Button>
                <Button onClick={handleExportToNewSchema} disabled={!selectedCommunity} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export to New Schema
                </Button>
            </div>
          </header>
          <div className="grid flex-1 grid-cols-1 md:grid-cols-[2fr,5fr] gap-4 p-4 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <CommunityList 
                    firestore={oldFirestore} 
                    onSelectCommunity={handleSelectCommunity} 
                    selectedCommunityId={selectedCommunity?.id || null}
                />
              </div>
              <div className="flex flex-col gap-4 overflow-hidden">
                  <div className="h-1/2 overflow-y-auto">
                    <MemberList 
                        firestore={oldFirestore}
                        community={selectedCommunity}
                        onSelectMember={handleSelectMember}
                        selectedMemberId={selectedMember?.id || null}
                        onMembersLoaded={setCommunityMembers}
                        showEmail
                        showJoiningDate
                        showActions
                    />
                  </div>
                  <div className="h-1/2">
                    <MemberDetails 
                      firestore={oldFirestore}
                      member={selectedMember}
                      communityId={selectedCommunity?.id || null}
                    />
                  </div>
              </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>

    <ExportPreviewDialog 
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        data={exportData}
        onConfirm={confirmExport}
        isPending={isPending}
    />
    </>
  );
}
