'use client';
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Folder, Search, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

interface CommunityListProps {
  firestore: Firestore;
  onSelectCommunity: (data: DocumentData) => void;
  selectedCommunityId: string | null;
}

const CommunitySkeleton = () => (
    <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        ))}
    </div>
)

export default function CommunityList({ firestore, onSelectCommunity, selectedCommunityId }: CommunityListProps) {
  const [communities, setCommunities] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);


  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(firestore, 'communities'));
        const communityList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCommunities(communityList);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, [firestore]);

  const filteredCommunities = useMemo(() => {
    if (!searchTerm) return communities;
    return communities.filter(community =>
      community.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [communities, searchTerm]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
            <div className='flex items-center gap-2'>
                <Folder/> Communities
            </div>
            <span className="text-sm font-normal text-muted-foreground">{filteredCommunities.length} / {communities.length}</span>
        </CardTitle>
        <div className={cn("relative input-container flex items-center", searchFocused && 'gradient-border', 'rounded-md')}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
                id="community-search"
                placeholder=" "
                className="pl-10 h-9 border-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
            />
             <Label htmlFor="community-search" className="left-10">Type to search...</Label>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <CommunitySkeleton />
        ) : (
          <ScrollArea className="h-full">
            <ul className="space-y-1 pr-2">
              {filteredCommunities.map((community) => (
                <li key={community.id}>
                  <button 
                    className={cn(
                        "w-full text-left p-2 rounded-md hover:bg-muted transition-colors",
                        selectedCommunityId === community.id && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => onSelectCommunity(community)}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold truncate">{community.name || 'Unnamed Community'}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users size={12} />
                        <span>{community.usersList?.length || 0}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{community.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
