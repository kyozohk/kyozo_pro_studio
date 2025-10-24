'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, CheckCircle, Loader2, ShieldBan, ShieldCheck } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { checkContent } from '@/app/actions';

type ModerationResult = {
  isToxic: boolean;
  reason: string;
} | null;

export default function ModerationTool() {
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ModerationResult>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const moderationResult = await checkContent(text);
      setResult(moderationResult);
    });
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-primary/10 shadow-lg">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Type a community post here... e.g., 'This is amazing!' or something less friendly."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="text-base"
          />
          <Button type="submit" className="w-full font-bold" disabled={isPending || !text}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Check Content
          </Button>
        </form>

        {isPending && (
            <div className="mt-6 flex items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Analyzing content...</span>
            </div>
        )}

        {result && !isPending && (
          <div className="mt-6">
            {result.isToxic ? (
              <Alert variant="destructive">
                <ShieldBan className="h-4 w-4" />
                <AlertTitle>Content Flagged as Potentially Toxic</AlertTitle>
                <AlertDescription>
                  {result.reason || 'This content violates community guidelines.'}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-500 text-green-500 [&>svg]:text-green-500">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Content Approved</AlertTitle>
                <AlertDescription>
                  This content seems safe and follows community guidelines.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
