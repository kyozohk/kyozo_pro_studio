'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageSquare, Search } from 'lucide-react';
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
        const receivedMessagesQuery = query(
            collection(firestore, 'messages'),
            where('community', '==', communityId),
            // We have to filter by memberId on the client side
        );
        const sentMessagesQuery = query(
            collection(firestore, 'sendwamessagehistories'),
            where('community', '==', communityId),
            where('sender', '==', memberId)
        );

        const [receivedSnapshot, sentSnapshot] = await Promise.all([
            getDocs(receivedMessagesQuery),
            getDocs(sentMessagesQuery),
        ]);

        const receivedMessages = receivedSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(msg => {
                // readBy can be an array or an object
                if (Array.isArray(msg.readBy)) {
                    return msg.readBy.some((r: any) => r.userId === memberId);
                } else if (typeof msg.readBy === 'object' && msg.readBy !== null) {
                    return (msg.readBy as any).user === memberId;
                }
                return false;
            });
            
        const sentMessages = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const allUserMessages = [...receivedMessages, ...sentMessages].filter(msg => msg.text);

        allUserMessages.sort((a, b) => {
            const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
            const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
            return dateA.getTime() - dateB.getTime();
        });

        setMessages(allUserMessages);

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

  const formatDate = (date: any) => {
    if (!date) return 'No date';
    try {
        const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
        return format(d, 'PPpp');
    } catch {
        return 'Invalid date';
    }
  }


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
                            From: {message.sender || (message.readBy as any)?.user || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(message.createdAt)}
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
