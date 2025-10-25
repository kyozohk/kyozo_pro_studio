
'use server';

import { waitlistSchema, type WaitlistInput } from '@/lib/types';
import { moderateCommunityContent } from '@/ai/flows/community-content-moderation';
import { revalidatePath } from 'next/cache';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);


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

export async function exportCommunity(community: any, members: any[], tenantId: string) {
    try {
        const batch = db.batch();

        const tenantRef = db.doc(`tenants/${tenantId}`);
        batch.set(tenantRef, {
            tenantId: tenantId,
            name: `${community.createdBy}'s Organization`,
            email: 'user@example.com', // This should be dynamic
            subscription: { plan: 'free', status: 'active' }
        }, { merge: true });

        const communityRef = db.doc(`tenants/${tenantId}/communities/${community.communityId}`);
        batch.set(communityRef, community);

        members.forEach(member => {
            const memberRef = db.doc(`tenants/${tenantId}/communities/${community.communityId}/memberships/${member.id}`);
            batch.set(memberRef, {
                memberId: member.id,
                role: member.role?.includes('admin') ? 'admin' : 'member',
                status: member.status || 'active',
                joinDate: member.joinDate ? new Date(member.joinDate) : new Date(),
            });
        });

        const userRef = db.doc(`users/${tenantId}`);
        batch.update(userRef, {
             tenants: FieldValue.arrayUnion(tenantId)
        });

        await batch.commit();

        revalidatePath('/dashboard');
        revalidatePath('/communities');
        return { success: true, message: 'Community exported successfully!' };

    } catch (error: any) {
        console.error('Error exporting community:', error);
        return { success: false, message: `Failed to export community: ${error.message}` };
    }
}

export async function createCommunity(communityData: any, tenantId: string, userEmail: string, userName: string) {
    try {
        const batch = db.batch();

        const tenantRef = db.doc(`tenants/${tenantId}`);
        batch.set(tenantRef, {
            tenantId: tenantId,
            name: `${userName}'s Organization`,
            email: userEmail,
            subscription: { plan: 'free', status: 'active' }
        }, { merge: true });

        const communityRef = db.collection(`tenants/${tenantId}/communities`).doc();
        const newCommunity = {
            ...communityData,
            communityId: communityRef.id,
            createdBy: tenantId,
            memberCount: 1,
            createdAt: FieldValue.serverTimestamp()
        };
        batch.set(communityRef, newCommunity);

        const membershipRef = db.doc(`tenants/${tenantId}/communities/${communityRef.id}/memberships/${tenantId}`);
        batch.set(membershipRef, {
            memberId: tenantId,
            role: 'admin',
            status: 'active',
            joinDate: FieldValue.serverTimestamp()
        });

        const userRef = db.doc(`users/${tenantId}`);
        batch.update(userRef, {
             tenants: FieldValue.arrayUnion(tenantId)
        });

        await batch.commit();
        
        revalidatePath('/dashboard');
        revalidatePath('/communities');

        return { success: true, message: 'Community created successfully!', data: { id: communityRef.id, ...newCommunity }};

    } catch (error: any) {
        console.error("Error creating community:", error);
        return { success: false, message: `Failed to create community: ${error.message}` };
    }
}
