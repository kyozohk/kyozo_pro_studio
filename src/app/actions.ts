'use server';

import { waitlistSchema, type WaitlistInput } from '@/lib/types';
import { moderateCommunityContent } from '@/ai/flows/community-content-moderation';
import { revalidatePath } from 'next/cache';
import { getApps, initializeApp, getApp, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    // If you have a service account key, you can use it like this:
    // const serviceAccount = require('../../../serviceAccountKey.json');
    // initializeApp({ credential: cert(serviceAccount) });
    // For environments like Google Cloud Run, initialization is often automatic
    initializeApp();
}

const adminFirestore = getAdminFirestore();


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

export async function exportCommunity(communityData: any, members: any[]) {
    try {
        const batch = adminFirestore.batch();
        const tenantId = communityData.createdBy;

        // 1. Create/update Tenant
        const tenantRef = adminFirestore.collection('tenants').doc(tenantId);
        batch.set(tenantRef, {
            tenantId: tenantId,
            name: `${communityData.name}'s Organization`, // Placeholder name
            email: 'placeholder@example.com', // Placeholder email
            subscription: {
                plan: 'pro',
                status: 'active'
            }
        }, { merge: true });

        // 2. Create Community
        const communityRef = tenantRef.collection('communities').doc(communityData.communityId);
        batch.set(communityRef, communityData);

        // 3. Create Memberships and update user profiles
        for (const member of members) {
            const memberId = member.id;

            // Create membership doc
            const membershipRef = communityRef.collection('memberships').doc(memberId);
            batch.set(membershipRef, {
                memberId: memberId,
                role: member.role === 'community_admin' ? 'admin' : 'member',
                status: 'active',
                joinDate: member.joinDate || new Date().toISOString(),
            });
            
            // Update user's tenant list
            const userRef = adminFirestore.collection('users').doc(memberId);
             batch.update(userRef, {
                tenants: getAdminFirestore.FieldValue.arrayUnion(tenantId)
            });
        }
        
        await batch.commit();

        // Revalidate paths to show new data
        revalidatePath('/dashboard');
        revalidatePath('/communities');
        
        return { success: true, message: `Community '${communityData.name}' and its ${members.length} members imported successfully!` };
    } catch(error: any) {
        console.error('Error exporting community:', error);
        return { success: false, message: `Import failed: ${error.message}` };
    }
}
