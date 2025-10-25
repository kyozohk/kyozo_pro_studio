'use client';

import { useEffect, useState, useTransition } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, type DocumentData } from 'firebase/firestore';
import { oldFirebaseConfig } from '@/firebase/old-config';
import { Loader2, Download } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { Logo } from '@/components/landing/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { handleSignOut } from '@/firebase/auth/client';
import { LogOut, Home, Users, Settings, Database, LayoutGrid } from 'lucide-react';
import ExportPreviewDialog from './export-preview-dialog';
import { exportCommunity } from '@/app/actions';

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
    if (!selectedCommunity) {
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
      createdBy: selectedCommunity.owner, // tenantId will be owner
      
      // We will derive this on the new side, but for preview we can show it
      memberCount: communityMembers.length,
    };
    
    setExportData({ community: transformedCommunity, members: communityMembers });
    setIsPreviewOpen(true);
  }

  const confirmExport = () => {
    if (!exportData) return;

    startTransition(async () => {
        const result = await exportCommunity((exportData as any).community, (exportData as any).members);
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
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/dashboard" >
              <Home />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
              <SidebarMenuButton href="/communities">
                <LayoutGrid />
                <span>Communities</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/moderation">
              <Users />
              <span>Moderation</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/migrate" isActive>
              <Database />
              <span>Migrate</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex items-center gap-3 p-3">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-10 rounded-full"
                >
                  <Avatar className="size-10">
                    <AvatarImage
                      src={user.photoURL || undefined}
                      alt={user.displayName || 'User'}
                    />
                    <AvatarFallback>
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => handleSignOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
             <div className="flex-1 overflow-hidden whitespace-nowrap group-[[data-state=collapsed]]/sidebar-wrapper:hidden">
                <p className="text-sm font-semibold">{user.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
        </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto text-center mb-6">
              <h1 className="font-headline text-4xl font-bold">Database Migration Tool</h1>
              <p className="mt-4 text-muted-foreground">
                  Select a community to see its members, then export the data.
              </p>
          </div>
          <div className="max-w-7xl mx-auto mb-6 text-center flex items-center justify-center gap-4">
               <Button onClick={handleExport} disabled={!selectedCommunity}>
                  <Download className="mr-2 h-4 w-4" />
                  Export to JSON
              </Button>
              <Button onClick={handleExportToNewSchema} disabled={!selectedCommunity}>
                <Download className="mr-2 h-4 w-4" />
                Export to New Schema
              </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[2fr,5fr] gap-8 max-w-7xl mx-auto">
              <CommunityList 
                  firestore={oldFirestore} 
                  onSelectCommunity={handleSelectCommunity} 
                  selectedCommunityId={selectedCommunity?.id || null}
              />
              <div className="flex flex-col gap-4">
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
                <MemberDetails 
                  firestore={oldFirestore}
                  member={selectedMember}
                  communityId={selectedCommunity?.id || null}
                />
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
