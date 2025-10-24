'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, type DocumentData, type Firestore } from 'firebase/firestore';
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
        const membersRef = collection(firestore, 'communities', communityId, 'members');
        const membersSnapshot = await getDocs(membersRef);
        
        const memberPromises = membersSnapshot.docs.map(async (memberDoc) => {
          const memberData = memberDoc.data();
          if (memberData.user && memberData.user.path) {
            const userDocRef = doc(firestore, memberData.user.path);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              return { id: userDoc.id, ...userDoc.data() };
            }
          }
          return null;
        });

        const memberList = (await Promise.all(memberPromises)).filter(member => member !== null) as DocumentData[];
        
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
                        <p className="font-semibold truncate">{member.name || member.displayName || 'Unnamed Member'}</p>
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
