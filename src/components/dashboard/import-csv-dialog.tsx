'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

interface ImportCsvDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (communityData: any, members: any[]) => void;
}

export default function ImportCsvDialog({ isOpen, onClose, onImport }: ImportCsvDialogProps) {
    const { toast } = useToast();
    const [communityFile, setCommunityFile] = useState<File | null>(null);
    const [membersFile, setMembersFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const communityInputRef = useRef<HTMLInputElement>(null);
    const membersInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'community' | 'members') => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/json') {
            if (type === 'community') {
                setCommunityFile(file);
            } else {
                setMembersFile(file);
            }
        } else {
            toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a valid JSON file.' });
        }
    };
    
    const parseJsonFile = (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const result = JSON.parse(event.target?.result as string);
                    resolve(result);
                } catch (error) {
                    reject(new Error('Failed to parse JSON file.'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file.'));
            reader.readAsText(file);
        });
    };

    const handleImportClick = async () => {
        if (!communityFile || !membersFile) {
            toast({ variant: 'destructive', title: 'Files Missing', description: 'Please select both community and members JSON files.' });
            return;
        }

        setIsParsing(true);
        try {
            const communityData = await parseJsonFile(communityFile);
            const membersData = await parseJsonFile(membersFile);
            
            if(!Array.isArray(membersData)){
                 toast({ variant: 'destructive', title: 'Invalid Format', description: 'Members file should be a JSON array.' });
                 setIsParsing(false);
                 return;
            }
            
            onImport(communityData, membersData);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Import Error', description: error.message });
        } finally {
            setIsParsing(false);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Community from JSON</DialogTitle>
                    <DialogDescription>
                        Select the JSON files exported from the 'Migrate' tab.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Community Data (.json)</label>
                         <Button variant="outline" className="w-full justify-start" onClick={() => communityInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            {communityFile ? communityFile.name : 'Select community file'}
                        </Button>
                        <input type="file" accept=".json" ref={communityInputRef} onChange={(e) => handleFileSelect(e, 'community')} className="hidden" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Members Data (.json)</label>
                         <Button variant="outline" className="w-full justify-start" onClick={() => membersInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            {membersFile ? membersFile.name : 'Select members file'}
                        </Button>
                        <input type="file" accept=".json" ref={membersInputRef} onChange={(e) => handleFileSelect(e, 'members')} className="hidden" />
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleImportClick} disabled={isParsing || !communityFile || !membersFile}>
                        {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}