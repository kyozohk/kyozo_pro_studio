'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code } from "lucide-react";

interface CommunityDetailsProps {
    communityData: any;
}

export default function CommunityDetails({ communityData }: CommunityDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Code /> Selected Community Data</CardTitle>
            </CardHeader>
            <CardContent>
                {communityData ? (
                    <ScrollArea className="h-48 w-full rounded-md border bg-muted/20 p-4">
                        <pre className="text-xs">
                            {JSON.stringify(communityData, null, 2)}
                        </pre>
                    </ScrollArea>
                ) : (
                    <p className="text-muted-foreground">Select a community from the list below to view its raw data.</p>
                )}
            </CardContent>
        </Card>
    );
}
