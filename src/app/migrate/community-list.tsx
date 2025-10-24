'use client';
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Folder, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface CommunityListProps {
  firestore: Firestore;
  onSelectCommunity: (data: DocumentData) => void;
  selectedCommunityId: string | null;
}

export default function CommunityList({ firestore, onSelectCommunity, selectedCommunityId }: CommunityListProps) {
  const [communities, setCommunities] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
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
        <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
                placeholder="Type to search..."
                className="pl-10 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-full">
            <ul className="space-y-2">
              {filteredCommunities.map((community) => (
                <li key={community.id}>
                  <button 
                    className={cn(
                        "w-full text-left p-2 rounded-md hover:bg-muted transition-colors",
                        selectedCommunityId === community.id && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => onSelectCommunity(community)}
                  >
                    <p className="font-semibold truncate">{community.name || 'Unnamed Community'}</p>
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
