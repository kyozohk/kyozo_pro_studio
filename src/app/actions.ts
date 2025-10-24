'use server';

import { waitlistSchema, type WaitlistInput } from '@/lib/types';
import { moderateCommunityContent } from '@/ai/flows/community-content-moderation';
import { revalidatePath } from 'next/cache';

import { initializeFirebase } from '@/firebase';
import { getFirestore, writeBatch, doc, serverTimestamp, arrayUnion } from 'firebase/firestore';


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
    // Use the client SDK for writes, assuming rules allow it.
    const { firestore } = initializeFirebase();
    if (!firestore) {
      return { success: false, message: 'Firestore is not initialized.' };
    }
    
    try {
        const tenantId = communityData.owner;
        if (!tenantId) {
            throw new Error('Community data does not have an owner ID.');
        }

        const batch = writeBatch(firestore);

        // 1. Create/update tenant document
        const tenantRef = doc(firestore, 'tenants', tenantId);
        batch.set(tenantRef, {
            tenantId: tenantId,
            name: 'Migrated Tenant', // Placeholder
            email: 'owner@example.com', // Placeholder
            subscription: { plan: 'pro', status: 'active' },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });

        // 2. Create community document
        const communityRef = doc(tenantRef, 'communities', communityData.id);
        batch.set(communityRef, {
            communityId: communityData.id,
            name: communityData.name,
            description: communityData.lore || '',
            profile: {
                logoUrl: communityData.communityProfileImage || null,
                bannerUrl: communityData.communityBackgroundImage || null,
            },
            tags: communityData.tags || [],
            visibility: communityData.communityPrivacy || 'private',
            memberCount: members.length,
            createdBy: tenantId,
            createdAt: communityData.createdAt ? new Date(communityData.createdAt) : serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // 3. Process members
        for (const member of members) {
             const memberId = member.id;
             
             // Create/update global user record
             const userRef = doc(firestore, 'users', memberId);
             batch.set(userRef, {
                 userId: memberId,
                 displayName: member.fullName || member.tempFullName || 'Unknown User',
                 email: member.email || null,
                 photoURL: member.profileImage || member.photoURL || null,
                 tenants: arrayUnion(tenantId),
             }, { merge: true });
             
             // In new schema, we don't have a separate tenant member record,
             // user profile and community membership is enough.

             // Create community membership record
             const membershipRef = doc(communityRef, 'memberships', memberId);
             const userInCommunity = communityData.usersList.find((u:any) => u.userId === memberId);
             batch.set(membershipRef, {
                 memberId: memberId,
                 joinDate: userInCommunity?.joinedAt ? new Date(userInCommunity.joinedAt) : serverTimestamp(),
                 status: userInCommunity?.approvalStatus || 'active',
                 role: 'member', // Placeholder, can be refined
             });
        }
        
        await batch.commit();

        return { success: true, message: `Community '${communityData.name}' and its ${members.length} members exported successfully!` };

    } catch (error: any) {
        console.error('Export failed:', error);
        return { success: false, message: `Export failed: ${error.message}` };
    }
}
