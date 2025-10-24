'use client';
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface MessageListProps {
  firestore: Firestore;
  communityId: string | null;
  memberId: string | null;
}

export default function MessageList({ firestore, communityId, memberId }: MessageListProps) {
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
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
        
        // As per the documentation, query messages where 'community' is the communityId
        // and 'readBy' array-contains the memberId.
        const messagesQuery = query(
            messagesRef, 
            where('community', '==', communityId), 
            where('readBy', 'array-contains', { userId: memberId }),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(messagesQuery);

        const messageList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setMessages(messageList);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [firestore, communityId, memberId]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare/> Messages</CardTitle>
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
            {messages.length > 0 ? (
                <div className="space-y-4 pr-4">
                {messages.map((message) => (
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
