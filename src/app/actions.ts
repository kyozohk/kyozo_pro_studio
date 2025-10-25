'use server';

import { waitlistSchema, type WaitlistInput } from '@/lib/types';
import { moderateCommunityContent } from '@/ai/flows/community-content-moderation';
import { revalidatePath } from 'next/cache';
import { getFirestore, doc, writeBatch, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Helper to initialize Firebase Admin SDK
// This should be done once per server instance.
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);


// This needs to be a client-side function, will move later
export async function joinWaitlist(data: WaitlistInput) {
  const parsedData = waitlistSchema.safeParse(data);

  if (!parsedData.success) {
    // Flatten errors for easier display
    const errorMessages = parsedData.error.flatten().fieldErrors;
    const firstError = Object.values(errorMessages)[0]?.[0] || 'Invalid data provided.';
    return { success: false, message: firstError };
  }

  // Here you would typically save the data to a database (e.g., Firestore)
  console.log('New waitlist submission:', parsedData.data);

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  revalidatePath('/');

  return { success: true, message: 'You have been added to the waitlist!' };
}

export async function checkContent(text: string): Promise<{ isToxic: boolean; reason: string; }> {
    if (!text || text.trim().length === 0) {
        return { isToxic: false, reason: '' };
    }
    try {
        const result = await moderateCommunityContent({ text });
        return { isToxic: result.isToxic, reason: result.toxicityReason || '' };
    } catch (error) {
        console.error('Error moderating content:', error);
        return { isToxic: false, reason: 'An error occurred while processing the content.' };
    }
}


export async function exportCommunity(communityData: any, members: any[], tenantId: string) {
    try {
        const batch = writeBatch(db);

        // 1. Create the tenant document (if it doesn't exist)
        const tenantRef = doc(db, 'tenants', tenantId);
        batch.set(tenantRef, {
            tenantId: tenantId,
            name: `${tenantId}'s Organization`, // Placeholder name
            email: 'owner@example.com', // Placeholder email
            subscription: { plan: 'free', status: 'active' }
        }, { merge: true });

        // 2. Create the community document
        const communityRef = doc(db, 'tenants', tenantId, 'communities', communityData.communityId);
        batch.set(communityRef, {
            ...communityData,
            createdAt: serverTimestamp()
        });

        // 3. Create membership documents for each member
        members.forEach(member => {
            const memberRef = doc(db, 'tenants', tenantId, 'communities', communityData.communityId, 'memberships', member.id);
            batch.set(memberRef, {
                memberId: member.id,
                role: member.role || 'member',
                status: 'active',
                joinDate: member.joinDate ? new Date(member.joinDate) : serverTimestamp(),
            });
        });

        // 4. Update the user's tenants array
        const userRef = doc(db, 'users', tenantId);
        batch.update(userRef, {
            tenants: arrayUnion(tenantId)
        });

        await batch.commit();

        return { success: true, message: 'Community and members exported successfully!' };

    } catch (error: any) {
        console.error("Error exporting community:", error);
        return { success: false, message: `Failed to export community. Reason: ${error.message}` };
    }
}
