'use client';
import { useAuth } from '@/firebase/auth-provider';

export default function DashboardWelcome() {
    const { user } = useAuth();

    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">
                Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-2">Here's what's happening in your communities.</p>
        </div>
    )
}
