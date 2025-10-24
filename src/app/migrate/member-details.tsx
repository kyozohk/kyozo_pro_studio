'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Phone } from 'lucide-react';
import type { DocumentData, Firestore } from 'firebase/firestore';
import MessageList from './message-list';

interface MemberDetailsProps {
    firestore: Firestore;
    member: DocumentData | null;
    communityId: string | null;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null }) => (
    <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-1">{icon}</div>
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    </div>
);

export default function MemberDetails({ firestore, member, communityId }: MemberDetailsProps) {
    if (!member) {
        return (
            <Card>
                <CardContent className="pt-6 flex items-center justify-center text-muted-foreground h-full">
                    <p>Select a member to see their details and messages.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Member Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DetailItem icon={<User size={16} />} label="Full Name" value={member.fullName || member.displayName || member.tempFullName} />
                    <DetailItem icon={<Mail size={16} />} label="Email" value={member.email} />
                    <DetailItem icon={<Phone size={16} />} label="Phone" value={member.phoneNumber} />
                </CardContent>
            </Card>
            <div className="h-[40vh] lg:h-auto">
                <MessageList 
                    firestore={firestore}
                    communityId={communityId}
                    memberId={member.id}
                />
            </div>
        </div>
    )
}
