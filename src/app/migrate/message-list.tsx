'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, type DocumentData, type Firestore, or } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface MessageListProps {
  firestore: Firestore;
  communityId: string | null;
  memberId: string | null;
}

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
        const messagesRef = collection(firestore, 'messages');
        
        // As per the schema, we need to find messages where the selected member is either the sender or part of the recipients.
        // The old schema might use a simple `recipientId` for 1-on-1 or `recipients` array for group.
        // We will query for messages where the member is either the sender or the recipient.
        const messagesQuery = query(
            messagesRef, 
            where('community', '==', communityId),
            or(
              where('sender', '==', memberId),
              where('recipientId', '==', memberId) // Assuming recipientId exists for direct messages
            ),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(messagesQuery);

        const messageList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setMessages(messageList);
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Fallback or secondary query if the first fails.
        // This might happen if 'recipientId' doesn't exist. Let's try with 'readBy' as a fallback.
        try {
            const fallbackQuery = query(
                collection(firestore, 'messages'),
                where('community', '==', communityId),
                where('readBy', 'array-contains', { userId: memberId }),
                orderBy('createdAt', 'desc')
            );
            const fallbackSnapshot = await getDocs(fallbackQuery);
            const fallbackMessageList = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(fallbackMessageList);

        } catch (fallbackError) {
             console.error("Fallback query for messages also failed:", fallbackError);
             setMessages([]);
        }
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
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
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
                            {message.createdAt?.toDate ? format(message.createdAt.toDate(), 'PPpp') : 'No date'}
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
