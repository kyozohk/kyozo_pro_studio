'use server';

import { waitlistSchema, type WaitlistInput } from '@/lib/types';
import { moderateCommunityContent } from '@/ai/flows/community-content-moderation';
import { revalidatePath } from 'next/cache';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';


function getAdminApp() {
    if (getApps().length > 0) {
        return getApp();
    } else {
        return initializeApp();
    }
}

function getAdminDb() {
    return getAdminFirestore(getAdminApp());
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
    try {
        const adminFirestore = getAdminDb();
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
                tenants: FieldValue.arrayUnion(tenantId)
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

export async function createCommunity(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';
    const userId = formData.get('userId') as string;
    const userEmail = formData.get('userEmail') as string;
    const userName = formData.get('userName') as string;

    if (!name || !userId) {
        return { success: false, message: 'Missing required data.' };
    }

    try {
        const adminFirestore = getAdminDb();
        const batch = adminFirestore.batch();
        const tenantId = userId; // Use user ID as tenant ID

        // 1. Check if tenant exists, if not, create it
        const tenantRef = adminFirestore.collection('tenants').doc(tenantId);
        const tenantSnap = await tenantRef.get();
        if (!tenantSnap.exists) {
            batch.set(tenantRef, {
                tenantId: tenantId,
                name: `${userName}'s Organization`,
                email: userEmail,
                subscription: { plan: 'free', status: 'active' }
            });
        }
        
        // 2. Create the new community
        const communityRef = adminFirestore.collection('tenants').doc(tenantId).collection('communities').doc();
        const newCommunityData = {
            communityId: communityRef.id,
            name,
            description,
            visibility: isPublic ? 'public' : 'private',
            createdBy: tenantId,
            memberCount: 1,
            profile: {
                logoUrl: '',
                bannerUrl: ''
            },
            createdAt: FieldValue.serverTimestamp()
        };
        batch.set(communityRef, newCommunityData);
        
        // 3. Add the creator as a member of the community
        const membershipRef = communityRef.collection('memberships').doc(userId);
        batch.set(membershipRef, {
            memberId: userId,
            role: 'admin',
            status: 'active',
            joinDate: FieldValue.serverTimestamp()
        });

        // 4. Update the user's tenants list
        const userRef = adminFirestore.collection('users').doc(userId);
        batch.update(userRef, {
            tenants: FieldValue.arrayUnion(tenantId)
        });

        await batch.commit();

        revalidatePath('/communities');
        revalidatePath('/dashboard');

        return { success: true, message: `Community '${name}' created successfully!`, community: {id: communityRef.id, ...newCommunityData} };

    } catch (error: any) {
        console.error("Error creating community:", error);
        return { success: false, message: `Failed to create community: ${error.message}` };
    }
}
