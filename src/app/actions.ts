'use server';

import { waitlistSchema, type WaitlistInput } from '@/lib/types';
import { moderateCommunityContent } from '@/ai/flows/community-content-moderation';
import { revalidatePath } from 'next/cache';

import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Helper function to initialize Firebase Admin SDK and get DB instance
function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getFirestore();
}


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
    const newDb = getAdminDb();
    
    try {
        const tenantId = communityData.owner;
        if (!tenantId) {
            throw new Error('Community data does not have an owner ID.');
        }

        const batch = newDb.batch();

        // 1. Create/update tenant document
        const tenantRef = newDb.collection('tenants').doc(tenantId);
        batch.set(tenantRef, {
            tenantId: tenantId,
            name: 'Migrated Tenant', // Placeholder
            email: 'owner@example.com', // Placeholder
            subscription: { plan: 'pro', status: 'active' },
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        // 2. Create community document
        const communityRef = tenantRef.collection('communities').doc(communityData.id);
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
            createdAt: communityData.createdAt ? new Date(communityData.createdAt) : FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        // 3. Process members
        for (const member of members) {
             const memberId = member.id;
             
             // Create/update global user record
             const userRef = newDb.collection('users').doc(memberId);
             batch.set(userRef, {
                 userId: memberId,
                 basicProfile: {
                     name: member.fullName || member.tempFullName || 'Unknown User',
                     email: member.email || null,
                     phone: member.phoneNumber || null,
                 },
                 tenants: FieldValue.arrayUnion(tenantId),
                 createdAt: FieldValue.serverTimestamp(),
                 updatedAt: FieldValue.serverTimestamp(),
             }, { merge: true });

             // Create tenant-specific member record
             const tenantMemberRef = tenantRef.collection('members').doc(memberId);
             batch.set(tenantMemberRef, {
                 memberId: memberId,
                 profile: {
                    name: member.fullName || member.tempFullName || 'Unknown User',
                    email: member.email || null,
                    phone: member.phoneNumber || null,
                    avatarUrl: member.profileImage || member.photoURL || null,
                 },
                 communities: FieldValue.arrayUnion(communityData.id),
                 createdAt: FieldValue.serverTimestamp(),
                 updatedAt: FieldValue.serverTimestamp(),
             }, { merge: true });

             // Create community membership record
             const membershipRef = communityRef.collection('memberships').doc(memberId);
             const userInCommunity = communityData.usersList.find((u:any) => u.userId === memberId);
             batch.set(membershipRef, {
                 memberId: memberId,
                 joinDate: userInCommunity?.joinedAt ? new Date(userInCommunity.joinedAt) : FieldValue.serverTimestamp(),
                 status: userInCommunity?.approvalStatus || 'active',
                 role: 'member', // Placeholder
             });
        }
        
        await batch.commit();

        return { success: true, message: `Community '${communityData.name}' and its ${members.length} members exported successfully!` };

    } catch (error: any) {
        console.error('Export failed:', error);
        return { success: false, message: `Export failed: ${error.message}` };
    }
}
