'use client';

import { useAuth } from '@/firebase/auth-provider';
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
import CommunityList from '@/components/dashboard/community-list';

export default function CommunitiesPage() {
  const { user, loading, signOut } = useAuth();
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
      <Sidebar side="left" collapsible="icon" className="sidebar-container">
        <SidebarHeader className="sidebar-header">
          <div className="sidebar-logo-container">
            <div className="group-[[data-state=expanded]]/sidebar-wrapper:opacity-100 group-[[data-state=collapsed]]/sidebar-wrapper:opacity-0 transition-opacity duration-200">
              <Logo />
            </div>
          </div>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="sidebar-menu">
            <SidebarMenuItem className="sidebar-menu-item">
              <SidebarMenuButton 
                href="/dashboard" 
                icon={<Home className="sidebar-icon" />}
                className="sidebar-menu-button"
              >
                <span className="sidebar-text">Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="sidebar-menu-item">
              <SidebarMenuButton 
                href="/communities" 
                isActive 
                icon={<LayoutGrid className="sidebar-icon sidebar-icon-active" />}
                className="sidebar-menu-button sidebar-menu-button-active"
              >
                <span className="sidebar-text">Communities</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="sidebar-menu-item">
              <SidebarMenuButton 
                href="/moderation" 
                icon={<ShieldCheck className="sidebar-icon" />}
                className="sidebar-menu-button"
              >
                <span className="sidebar-text">Moderation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="sidebar-menu-item">
              <SidebarMenuButton 
                href="/migrate" 
                icon={<Database className="sidebar-icon" />}
                className="sidebar-menu-button"
              >
                <span className="sidebar-text">Migrate</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="sidebar-menu-item">
              <SidebarMenuButton 
                href="#" 
                icon={<Settings className="sidebar-icon" />}
                className="sidebar-menu-button"
              >
                <span className="sidebar-text">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="sidebar-footer">
          <SidebarSeparator />
          <SidebarUserProfile
              name={user.displayName}
              email={user.email}
              className="p-3"
              icon={
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              }
            />
            <div className="p-2">
                <button 
                  onClick={() => {
                    console.log('Sign out clicked');
                    signOut();
                  }}
                  className="signout-button"
                >
                  <LogOut className="sidebar-icon" />
                  <span className="sidebar-footer-text">Sign Out</span>
                </button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 sm:p-6">
          <CommunityList />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
