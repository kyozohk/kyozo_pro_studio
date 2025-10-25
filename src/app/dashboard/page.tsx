'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Loader2,
  Database,
  Settings,
  LayoutGrid,
  Users,
  Home,
  LogOut,
  FileCog,
  ShieldCheck,
} from 'lucide-react';
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
  SidebarSeparator,
  SidebarUserProfile,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/landing/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { handleSignOut } from '@/firebase/auth/client';
import DashboardWelcome from '@/components/dashboard/welcome';
import CommunityList from '@/components/dashboard/community-list';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    return names
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
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
          <SidebarMenu className="p-2">
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive icon={<Home />}>
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
              <SidebarMenuButton href="/migrate" icon={<Database />}>
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
          <SidebarUserProfile
              name={user.displayName}
              email={user.email}
              icon={
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              }
            />
            <SidebarMenu className="p-2">
                <SidebarMenuItem>
                    <SidebarMenuButton icon={<LogOut />} onClick={() => handleSignOut()}>
                        Sign Out
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 sm:p-6">
          <DashboardWelcome />
          <CommunityList />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
