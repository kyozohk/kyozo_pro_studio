'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Database, Settings } from 'lucide-react';
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
import Link from 'next/link';
import { Logo } from '@/components/landing/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { handleSignOut } from '@/firebase/auth/client';
import { LogOut, Home, Users } from 'lucide-react';
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
          <div className="flex h-12 items-center justify-between px-2">
            <div className="flex items-center gap-2 [&>svg]:hidden">
              <Logo />
            </div>
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/moderation">
                <Users />
                Moderation
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/migrate">
                <Database />
                Migrate
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex items-center gap-2 p-2">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
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
             <div className="flex-1 overflow-hidden whitespace-nowrap">
                <p className="text-sm font-semibold">{user.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="ml-auto flex items-center gap-4">
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <DashboardWelcome />
          <CommunityList />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
