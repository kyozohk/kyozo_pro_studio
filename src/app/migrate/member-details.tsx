'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Clipboard, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MemberDetailsProps {
    memberData: any;
}

export default function MemberDetails({ memberData }: MemberDetailsProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        if (!memberData) return;
        const jsonString = JSON.stringify(memberData, null, 2);
        navigator.clipboard.writeText(jsonString).then(() => {
            setCopied(true);
            toast({ title: "Copied!", description: "Member data copied to clipboard." });
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            toast({ variant: "destructive", title: "Failed to copy", description: "Could not copy data to clipboard." });
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><User /> Selected Member Data</CardTitle>
                <Button variant="outline" size="icon" onClick={handleCopy} disabled={!memberData}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                    <span className="sr-only">Copy JSON</span>
                </Button>
            </CardHeader>
            <CardContent>
                {memberData ? (
                    <ScrollArea className="h-48 w-full rounded-md border bg-muted/20 p-4">
                        <pre className="text-xs">
                            {JSON.stringify(memberData, null, 2)}
                        </pre>
                    </ScrollArea>
                ) : (
                    <p className="text-muted-foreground">Select a member from the list to view their raw data.</p>
                )}
            </CardContent>
        </Card>
    );
}
