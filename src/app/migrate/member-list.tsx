'use client';
import { useState, useEffect } from 'react';
import { collection, doc, getDoc, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MemberListProps {
  firestore: Firestore;
  community: DocumentData | null;
  onSelectMember: (data: DocumentData) => void;
  selectedMemberId: string | null;
}

export default function MemberList({ firestore, community, onSelectMember, selectedMemberId }: MemberListProps) {
  const [members, setMembers] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!community) {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      setLoading(true);
      const userIds = community.usersList?.map((u: any) => u.userId) || [];
      
      if (userIds.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }
      
      try {
        const memberPromises = userIds.map((id: string) => getDoc(doc(firestore, 'users', id)));
        const memberSnapshots = await Promise.all(memberPromises);
        const memberList = memberSnapshots
            .filter(snap => snap.exists())
            .map(snap => ({ id: snap.id, ...snap.data() }));

        setMembers(memberList);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [firestore, community]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users/> Members</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !community ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a community to see its members.</p>
            </div>
        ) : (
          <ScrollArea className="h-full">
             {members.length > 0 ? (
                <ul className="space-y-2">
                {members.map((member) => (
                    <li key={member.id}>
                    <button 
                        className={cn(
                            "w-full text-left p-2 rounded-md hover:bg-muted transition-colors",
                            selectedMemberId === member.id && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                        onClick={() => onSelectMember(member)}
                    >
                        <p className="font-semibold truncate">{member.fullName || member.displayName || member.tempFullName || 'Unnamed Member'}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email || member.id}</p>
                    </button>
                    </li>
                ))}
                </ul>
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No members found for this community.</p>
                </div>
             )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
