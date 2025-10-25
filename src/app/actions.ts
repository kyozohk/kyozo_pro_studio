'use server';

import { waitlistSchema, type WaitlistInput } from '@/lib/types';
import { moderateCommunityContent } from '@/ai/flows/community-content-moderation';
import { revalidatePath } from 'next/cache';
import { getFirestore, doc, writeBatch, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export async function joinWaitlist(data: WaitlistInput) {
  const parsedData = waitlistSchema.safeParse(data);

  if (!parsedData.success) {
    const errorMessages = parsedData.error.flatten().fieldErrors;
    const firstError = Object.values(errorMessages)[0]?.[0] || 'Invalid data provided.';
    return { success: false, message: firstError };
  }

  console.log('New waitlist submission:', parsedData.data);
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
    const batch = writeBatch(db);

    const tenantRef = doc(db, 'tenants', tenantId);
    batch.set(tenantRef, {
        tenantId: tenantId,
        name: `${tenantId}'s Organization`, 
        email: 'owner@example.com',
        subscription: { plan: 'free', status: 'active' }
    }, { merge: true });

    const communityRef = doc(db, 'tenants', tenantId, 'communities', communityData.communityId);
    batch.set(communityRef, {
        ...communityData,
        createdAt: serverTimestamp()
    });

    members.forEach(member => {
        const memberRef = doc(db, 'tenants', tenantId, 'communities', communityData.communityId, 'memberships', member.id);
        batch.set(memberRef, {
            memberId: member.id,
            role: member.role || 'member',
            status: 'active',
            joinDate: member.joinDate ? new Date(member.joinDate) : serverTimestamp(),
        });
    });

    const userRef = doc(db, 'users', tenantId);
    batch.set(userRef, {
        tenants: arrayUnion(tenantId)
    }, { merge: true });

    try {
        await batch.commit();
        return { success: true, message: 'Community and members exported successfully!' };
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: `transactions (batch write)`,
            operation: 'write',
            requestResourceData: { communityData, members, tenantId },
        }, serverError);
        
        // This will be caught by the global error handler
        errorEmitter.emit('permission-error', permissionError);

        return { success: false, message: serverError.message };
    }
}
