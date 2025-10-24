'use client';
import { useState, useEffect, useMemo } from 'react';
import { collection, doc, getDoc, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Search, MoreVertical, Edit, MessageSquare, Phone, Mail, Trash2, List, LayoutGrid } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';

interface MemberListProps {
  firestore: Firestore;
  community: DocumentData | null;
  onSelectMember: (data: DocumentData) => void;
  selectedMemberId: string | null;
  onMembersLoaded: (members: DocumentData[]) => void;
  showEmail?: boolean;
  showPhoneNumber?: boolean;
  showJoiningDate?: boolean;
  showActions?: boolean;
}

const MemberSkeleton = () => (
  <div className="space-y-2">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))}
  </div>
);

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

export default function MemberList({ 
    firestore, 
    community, 
    onSelectMember, 
    selectedMemberId, 
    onMembersLoaded,
    showEmail = false,
    showPhoneNumber = true,
    showJoiningDate = false,
    showActions = false,
}: MemberListProps) {
  const [members, setMembers] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'icon'>('icon');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (!community) {
      setMembers([]);
      onMembersLoaded([]);
      return;
    }

    const fetchMembers = async () => {
      setLoading(true);
      const userIds = community.usersList?.map((u: any) => u.userId) || [];
      
      if (userIds.length === 0) {
        setMembers([]);
        onMembersLoaded([]);
        setLoading(false);
        return;
      }
      
      try {
        const memberPromises = userIds.map((id: string) => getDoc(doc(firestore, 'users', id)));
        const memberSnapshots = await Promise.all(memberPromises);
        const memberList = memberSnapshots
            .filter(snap => snap.exists())
            .map(snap => {
                const communityUser = community.usersList.find((u:any) => u.userId === snap.id);
                return { 
                    id: snap.id, 
                    ...snap.data(),
                    joinDate: communityUser?.joinedAt,
                    status: communityUser?.approvalStatus || 'active',
                }
            });

        memberList.sort((a, b) => {
            const roleA = a.role || 'user';
            const roleB = b.role || 'user';
            if (roleA.includes('admin') && !roleB.includes('admin')) return -1;
            if (!roleA.includes('admin') && roleB.includes('admin')) return 1;
            return (a.fullName || a.displayName || '').localeCompare(b.fullName || b.displayName || '');
        })

        setMembers(memberList);
        onMembersLoaded(memberList);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembers([]);
        onMembersLoaded([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [firestore, community, onMembersLoaded]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    const lowercasedTerm = searchTerm.toLowerCase();
    return members.filter(member => {
      const name = member.fullName || member.displayName || member.tempFullName || '';
      const email = member.email || '';
      return name.toLowerCase().includes(lowercasedTerm) || email.toLowerCase().includes(lowercasedTerm);
    });
  }, [members, searchTerm]);

  return (
    <Card className="flex flex-col bg-transparent border-0 shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center gap-2">
            <div className={cn("relative input-container flex items-center flex-1", searchFocused && 'gradient-border', 'rounded-md')}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                    id="member-search"
                    placeholder=" "
                    className="pl-10 h-9 bg-muted/40 border-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={!community}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                />
                <Label htmlFor="member-search" className="left-10">Search members...</Label>
            </div>
            <div className='flex items-center gap-1 bg-muted/40 p-1 rounded-lg'>
                <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('list')}>
                    <List size={16}/>
                </Button>
                <Button variant={viewMode === 'icon' ? 'primary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('icon')}>
                    <LayoutGrid size={16}/>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {loading ? (
          <MemberSkeleton />
        ) : !community ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a community to see its members.</p>
            </div>
        ) : (
          <ScrollArea className="h-full">
             {filteredMembers.length > 0 ? (
                viewMode === 'list' ? (
                    <ul className="space-y-1 pr-2">
                    {filteredMembers.map((member) => {
                        const name = member.fullName || member.displayName || member.tempFullName || 'Unknown User';
                        const role = member.role || 'Member';
                        const status = member.status || 'active';
                        const joinDate = member.joinDate ? format(new Date(member.joinDate), 'PP') : '-';
                        return (
                            <li key={member.id}>
                                <div 
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg hover:bg-muted/40 transition-colors flex items-center gap-4 cursor-pointer",
                                        "bg-card/50",
                                        selectedMemberId === member.id && "bg-primary/10"
                                    )}
                                    onClick={() => onSelectMember(member)}
                                >
                                    <Avatar className="h-10 w-10 text-lg bg-primary/20 text-primary-foreground">
                                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex-1 grid grid-cols-5 items-center gap-4'>
                                        <div className="col-span-1">
                                            <p className="font-semibold truncate">{name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{role}</p>
                                        </div>
                                        <div className="col-span-1 text-sm text-muted-foreground truncate">
                                            {showEmail ? (member.email || '-') : '-'}
                                        </div>
                                        <div className="col-span-1 text-sm text-muted-foreground">
                                            {showPhoneNumber ? (member.phoneNumber || '-') : '-'}
                                        </div>
                                        <div className="col-span-1 flex items-center gap-2 text-sm">
                                            <Badge variant={status === 'active' ? 'success' : 'secondary'} className="capitalize">{status}</Badge>
                                            {showJoiningDate && <span>{joinDate}</span>}
                                        </div>
                                        {showActions && (
                                            <div className="col-span-1 flex justify-end items-center gap-2 text-muted-foreground">
                                                <button className="hover:text-foreground"><Edit size={16} /></button>
                                                <button className="hover:text-foreground"><MessageSquare size={16} /></button>
                                                <button className="hover:text-foreground"><Phone size={16} /></button>
                                                <button className="hover:text-foreground"><Mail size={16} /></button>
                                                <button className="hover:text-destructive"><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                    </ul>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2">
                        {filteredMembers.map((member) => {
                            const name = member.fullName || member.displayName || member.tempFullName || 'Unknown User';
                            const role = member.role || 'Member';
                            const status = member.status || 'active';
                            return (
                                <div
                                    key={member.id}
                                    onClick={() => onSelectMember(member)}
                                    className={cn(
                                        "p-4 rounded-lg text-left transition-all cursor-pointer",
                                        "bg-card/50 hover:bg-muted/40",
                                        selectedMemberId === member.id && "bg-primary/10 ring-2 ring-primary"
                                    )}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <Avatar className="h-12 w-12 text-xl bg-primary/20 text-primary-foreground">
                                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                                        </Avatar>
                                        <div className='flex-1'>
                                            <p className="font-semibold truncate">{name}</p>
                                            <p className="text-sm text-muted-foreground capitalize">{role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mb-3">
                                        <Badge variant={status === 'active' ? 'success' : 'secondary'} className="capitalize">{status}</Badge>
                                        {showJoiningDate && member.joinDate && <span className="text-xs text-muted-foreground">{format(new Date(member.joinDate), 'PP')}</span>}
                                    </div>
                                    {showActions && (
                                        <div className="flex justify-end items-center gap-2 text-muted-foreground pt-3 border-t border-muted/20">
                                            <TooltipProvider>
                                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Edit size={16} /></Button></TooltipTrigger><TooltipContent><p>Edit</p></TooltipContent></Tooltip>
                                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MessageSquare size={16} /></Button></TooltipTrigger><TooltipContent><p>Message</p></TooltipContent></Tooltip>
                                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Phone size={16} /></Button></TooltipTrigger><TooltipContent><p>Call</p></TooltipContent></Tooltip>
                                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Mail size={16} /></Button></TooltipTrigger><TooltipContent><p>Email</p></TooltipContent></Tooltip>
                                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive"><Trash2 size={16} /></Button></TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )
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
