'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MemberListProps {
  firestore: Firestore;
  communityId: string | null;
  onSelectMember: (id: string) => void;
  selectedMemberId: string | null;
}

export default function MemberList({ firestore, communityId, onSelectMember, selectedMemberId }: MemberListProps) {
  const [members, setMembers] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!communityId) {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      setLoading(true);
      try {
        // Assumption: users collection has a 'communityIds' array field
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('communityIds', 'array-contains', communityId));
        const querySnapshot = await getDocs(q);
        const memberList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(memberList);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [firestore, communityId]);

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
        ) : !communityId ? (
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
                        onClick={() => onSelectMember(member.id)}
                    >
                        <p className="font-semibold truncate">{member.name || 'Unnamed Member'}</p>
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
