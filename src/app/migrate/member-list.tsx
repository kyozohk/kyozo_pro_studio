'use client';
import { useState, useEffect, useMemo } from 'react';
import { collection, doc, getDoc, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Users, Search, Crown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface MemberListProps {
  firestore: Firestore;
  community: DocumentData | null;
  onSelectMember: (data: DocumentData) => void;
  selectedMemberId: string | null;
}

const MemberSkeleton = () => (
  <div className="space-y-2">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center gap-2 p-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);


export default function MemberList({ firestore, community, onSelectMember, selectedMemberId }: MemberListProps) {
  const [members, setMembers] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

        // Sort by role, admins first
        memberList.sort((a, b) => {
            const roleA = a.communityHandles?.find((h:any) => h.communityId === community.id)?.role || 'user';
            const roleB = b.communityHandles?.find((h:any) => h.communityId === community.id)?.role || 'user';
            if (roleA.includes('admin') && !roleB.includes('admin')) return -1;
            if (!roleA.includes('admin') && roleB.includes('admin')) return 1;
            return (a.fullName || a.displayName || '').localeCompare(b.fullName || b.displayName || '');
        })

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

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    return members.filter(member => {
      const name = member.fullName || member.displayName || member.tempFullName || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [members, searchTerm]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
            <div className='flex items-center gap-2'>
                <Users/> Members
            </div>
            <span className="text-sm font-normal text-muted-foreground">{filteredMembers.length} / {members.length}</span>
        </CardTitle>
        <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
                placeholder="Type to search..."
                className="pl-10 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!community}
            />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <MemberSkeleton />
        ) : !community ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a community to see its members.</p>
            </div>
        ) : (
          <ScrollArea className="h-full">
             {filteredMembers.length > 0 ? (
                <ul className="space-y-1 pr-2">
                {filteredMembers.map((member) => {
                    const handle = member.communityHandles?.find((h:any) => h.communityId === community.id);
                    const role = handle?.role || 'user';
                    return (
                        <li key={member.id}>
                        <button 
                            className={cn(
                                "w-full text-left p-2 rounded-md hover:bg-muted transition-colors flex items-center gap-3",
                                selectedMemberId === member.id && "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                            onClick={() => onSelectMember(member)}
                        >
                            <div className='flex-1'>
                                <p className="font-semibold truncate">{member.fullName || member.displayName || member.tempFullName || 'Unnamed Member'}</p>
                                <p className="text-xs text-muted-foreground truncate">{member.email || member.id}</p>
                            </div>
                            {role.includes('admin') && <Crown className="h-4 w-4 text-yellow-500" />}
                            <Badge variant={role.includes('admin') ? "destructive" : "secondary"}>{role}</Badge>
                        </button>
                        </li>
                    )
                })}
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
