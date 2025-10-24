'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import styles from './FixedFooter.module.css';
import AuthDialog from '../auth/auth-dialog';
import { useUser } from '@/firebase';
import { handleSignOut } from '@/firebase/auth/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface FixedFooterProps {
  className?: string;
}

const FixedFooter: React.FC<FixedFooterProps> = ({ className = '' }) => {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Auto-redirect authenticated users to dashboard from home page
  useEffect(() => {
    if (user && pathname === '/') {
      router.push('/dashboard');
    }
  }, [user, router, pathname]);

  const openDialog = () => {
    if (!user) {
      setIsDialogOpen(true);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <footer className={`${styles.fixedFooter} ${className}`}>
        <div className={styles.container}>
          <div className={styles.logoButtonContainer}>
             <Link href="/" className={styles.buttonLogo}>
                <Image 
                src="/logo.png" 
                alt="Kyozo Logo" 
                width={100} 
                height={30} 
                />
             </Link>
            {user ? (
                <Button 
                    variant="default" 
                    onClick={() => router.push('/dashboard')}
                    className={styles.joinButton}
                    size="sm"
                >
                    Dashboard
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
