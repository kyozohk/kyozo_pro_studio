'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Folder } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CommunityListProps {
  firestore: Firestore;
  onSelectCommunity: (data: DocumentData) => void;
  selectedCommunityId: string | null;
}

export default function CommunityList({ firestore, onSelectCommunity, selectedCommunityId }: CommunityListProps) {
  const [communities, setCommunities] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Folder/> Communities</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-full">
            <ul className="space-y-2">
              {communities.map((community) => (
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
