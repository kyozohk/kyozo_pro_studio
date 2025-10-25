'use server';

import { waitlistSchema, type WaitlistInput } from '@/lib/types';
import { moderateCommunityContent } from '@/ai/flows/community-content-moderation';
import { revalidatePath } from 'next/cache';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { writeBatch, doc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';


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
    // This is a placeholder now. We will use the client SDK for this.
    // The server action now just simulates the import.
    try {
        console.log("Simulating community import for:", communityData.name);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // This is where you would interact with the *new* firestore instance
        // to write the data. For now, we'll just log it.
        console.log("Community data to be written:", communityData);
        console.log(`Found ${members.length} members to write.`);
        
        return { success: true, message: `Community '${communityData.name}' and its ${members.length} members imported successfully!` };
    } catch(error: any) {
        console.error('Import failed during simulation:', error);
        return { success: false, message: `Import failed: ${error.message}` };
    }
}
