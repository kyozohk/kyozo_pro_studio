'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import styles from './FixedFooter.module.css';
import AuthDialog from '../auth/auth-dialog';
import { useUser } from '@/firebase';
import { handleSignOut } from '@/firebase/auth/client';
import { useRouter, usePathname } from 'next/navigation';

interface FixedFooterProps {
  className?: string;
}

const FixedFooter: React.FC<FixedFooterProps> = ({ className = '' }) => {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (user && pathname === '/') {
      console.log('🔵 User authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, router, pathname]);

  const openDialog = () => {
    if (!user) {
      console.log('🔵 User not logged in, opening sign-in dialog');
      setIsDialogOpen(true);
    } else {
      console.log('🔵 User already logged in, redirecting to dashboard');
      router.push('/dashboard');
    }
  };

  const closeDialog = () => {
    console.log('🔵 Closing dialog');
    setIsDialogOpen(false);
  };

  const handleLogout = async () => {
    console.log('🔵 User logging out...');
    setIsLoggingOut(true);
    try {
      await handleSignOut();
      console.log('🔵 User logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't render footer on dashboard pages
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/migrate') || pathname?.startsWith('/moderation')) {
    return null;
  }

  return (
    <>
      <footer className={`${styles.fixedFooter} ${className}`}>
        <div className={styles.container}>
          <div className={styles.logoButtonContainer}>
            <Image 
              src="/logo.png" 
              alt="Kyozo Logo" 
              width={100} 
              height={30} 
              className={styles.buttonLogo}
            />
            {user ? (
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className={styles.joinButton}
                size="sm"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Sign Out'}
              </Button>
            ) : (
              <Button 
                variant="default" 
                onClick={openDialog}
                className={styles.joinButton}
                size="sm"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </footer>
      
      <AuthDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
};

export default FixedFooter;
