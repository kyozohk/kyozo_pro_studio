'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DocumentData } from 'firebase/firestore';
import { format } from 'date-fns';
import Image from 'next/image';

interface CommunityDetailsProps {
    community: DocumentData | null;
}

export default function CommunityDetails({ community }: CommunityDetailsProps) {
    if (!community) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Community Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center text-muted-foreground h-full">
                        <p>Select a community to see its details.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="relative h-32 w-full mb-4 rounded-t-lg bg-muted">
                    {community.communityBackgroundImage && (
                        <Image 
                            src={community.communityBackgroundImage} 
                            alt={`${community.name} banner`}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-t-lg"
                        />
                    )}
                </div>
                <div className='flex items-center gap-4 -mt-16 ml-4'>
                    <div className="relative h-24 w-24 rounded-full border-4 border-card bg-muted">
                        {community.communityProfileImage && (
                            <Image
                                src={community.communityProfileImage}
                                alt={`${community.name} logo`}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="rounded-full"
                            />
                        )}
                    </div>
                    <div>
                        <CardTitle className="text-2xl mt-12">{community.name || 'Unnamed Community'}</CardTitle>
                        <p className="text-sm text-muted-foreground">{community.id}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p>{community.lore || 'No description provided.'}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Privacy</h3>
                    <p className='capitalize'>{community.communityPrivacy || 'private'}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                    <p>{community.createdAt ? format(new Date(community.createdAt), 'PP') : '-'}</p>
                </div>
            </CardContent>
        </Card>
    )
}
