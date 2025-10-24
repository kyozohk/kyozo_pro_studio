'use client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, UploadCloud } from 'lucide-react';

interface ExportPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: object | null;
    onConfirm: () => void;
    isPending: boolean;
}

export default function ExportPreviewDialog({ open, onOpenChange, data, onConfirm, isPending }: ExportPreviewDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Export Preview</DialogTitle>
                    <DialogDescription>
                        Review the data that will be exported to the new Firestore schema.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96 w-full rounded-md border p-4">
                    <pre className="text-sm">
                        {data ? JSON.stringify(data, null, 2) : 'No data to display.'}
                    </pre>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onConfirm} disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <UploadCloud className="mr-2 h-4 w-4" />
                        )}
                        Confirm & Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
