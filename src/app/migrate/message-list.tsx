'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageListProps {
  firestore: Firestore;
  communityId: string | null;
  memberId: string | null;
}

const MessageSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-lg space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-2" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        ))}
    </div>
)

export default function MessageList({ firestore, communityId, memberId }: MessageListProps) {
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!memberId || !communityId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const messagesQuery = query(
            collection(firestore, 'messages'),
            where('community', '==', communityId),
        );
        const sentMessagesQuery = query(
            collection(firestore, 'sendwamessagehistories'),
            where('community', '==', communityId),
        );

        const [messagesSnapshot, sentMessagesSnapshot] = await Promise.all([
            getDocs(messagesQuery),
            getDocs(sentMessagesQuery),
        ]);

        const receivedMessages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sentMessages = sentMessagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const allCommunityMessages = [...receivedMessages, ...sentMessages];

        const userMessages = allCommunityMessages.filter(msg => 
            ((msg.readBy?.some((r: any) => r.userId === memberId)) || (msg.sender === memberId)) && msg.text
        );

        userMessages.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

        setMessages(userMessages);

      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [firestore, communityId, memberId]);

  const filteredMessages = useMemo(() => {
    if (!searchTerm) return messages;
    return messages.filter(message => 
        message.text?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [messages, searchTerm]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <MessageSquare/> Messages
            </div>
            <span className="text-sm font-normal text-muted-foreground">{filteredMessages.length} / {messages.length}</span>
        </CardTitle>
        <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
                placeholder="Type to search..."
                className="pl-10 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!memberId}
            />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <MessageSkeleton />
        ) : !memberId ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a member to see their messages.</p>
            </div>
        ) : (
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            {filteredMessages.length > 0 ? (
                <div className="space-y-4 pr-4">
                {filteredMessages.map((message) => (
                    <div key={message.id} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{message.text || 'No content'}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            From: {message.sender}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {message.createdAt?.seconds ? format(new Date(message.createdAt.seconds * 1000), 'PPpp') : 'No date'}
                        </p>
                    </div>
                ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No messages found for this member in this community.</p>
                </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
