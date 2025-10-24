'use client';
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, type DocumentData, type Firestore } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface MessageListProps {
  firestore: Firestore;
  memberId: string | null;
}

export default function MessageList({ firestore, memberId }: MessageListProps) {
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!memberId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const messagesRef = collection(firestore, 'messages');
        
        // As per the documentation, 'sender' is the sender's ID.
        // There isn't a clear recipient field for DMs, so we will query based on sender.
        // In a real scenario, we might need a composite query or a different data structure for 2-way chat.
        // For now, we fetch where the user is the sender. A more complex query might be needed for full conversation history.
        const sentQuery = query(messagesRef, where('sender', '==', memberId), orderBy('createdAt', 'desc'));

        const [sentSnapshot] = await Promise.all([
            getDocs(sentQuery),
        ]);

        const messageList: DocumentData[] = [];
        sentSnapshot.forEach(doc => messageList.push({ id: doc.id, ...doc.data() }));
        
        // Sorting is handled by the query, but if we were to merge multiple queries, we'd sort here.
        // messageList.sort((a, b) => {
        //     const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        //     const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        //     return dateA.getTime() - dateB.getTime();
        // });

        setMessages(messageList);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [firestore, memberId]);

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
                    <p>No messages found for this member.</p>
                </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
