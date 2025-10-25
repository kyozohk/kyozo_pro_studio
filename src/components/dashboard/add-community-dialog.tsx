'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CloudUpload, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import ImportCsvDialog from './import-csv-dialog';
import { createCommunity } from '@/app/actions';


interface AddCommunityDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (community: any) => void;
}

const iconOptions = [
    '/Parallax1.jpg',
    '/Parallax2.jpg',
    '/Parallax3.jpg',
    '/Parallax4.jpg',
    '/Parallax5.jpg',
];

export default function AddCommunityDialog({ isOpen, onClose, onSuccess }: AddCommunityDialogProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    
    const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);


    const handleFileChange = (file: File, type: 'banner' | 'icon') => {
        // Mock file handling
    };

    const handleIconOptionClick = (iconUrl: string) => {
        // Mock icon selection
    };
    
    const handleCsvImport = async (communityData: any, members: any[]) => {
      // This is a complex operation that needs a robust server-side implementation
      // For now, we'll just show a toast message
      toast({ title: 'Import Started', description: 'This feature is being implemented.' });
      onClose();
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a community.' });
            return;
        }

        const formData = new FormData(event.currentTarget);
        let communityName = formData.get('name') as string;
        let communityDesc = formData.get('description') as string;
        let visibility = (formData.get('isPublic') === 'true') ? 'public' : 'private';

        if (!communityName) {
            communityName = `My Awesome Community #${Math.floor(Math.random() * 1000)}`;
            communityDesc = `This is a default community called ${communityName}. We are awesome.`;
        }

        const communityData = {
          name: communityName,
          description: communityDesc,
          visibility: visibility,
          profile: { logoUrl: '', bannerUrl: '' },
        };
        
        startTransition(async () => {
            const result = await createCommunity(communityData, user.uid, user.email!, user.displayName!);
            
            if (result.success) {
                toast({ title: 'Community Created', description: `Successfully created ${communityName}` });
                onSuccess(result.data);
                onClose();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        });
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setIsPublic(true);
    }
    
    useEffect(() => {
        if(isOpen) {
            resetForm();
        }
    }, [isOpen]);

    return (
        <>
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0" onDragOver={(e) => e.preventDefault()}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 flex flex-col gap-6">
                            <div>
                                <DialogTitle className="text-2xl font-bold font-headline">Your Community Details</DialogTitle>
                                <DialogDescription>Create a new community and start building. Leave name blank to create a default one.</DialogDescription>
                            </div>
                            
                            <Input name="name" placeholder="Your Community Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <Textarea name="description" placeholder="Describe your community" value={description} onChange={(e) => setDescription(e.target.value)} />
                            <input type="hidden" name="isPublic" value={String(isPublic)} />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="privacy-toggle" className="font-medium">Privacy</Label>
                                    <p className="text-xs text-muted-foreground">Anyone can discover and join this community</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="privacy-toggle" className="text-sm">Private</Label>
                                    <Switch id="privacy-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
                                    <Label htmlFor="privacy-toggle" className="text-sm">Public</Label>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button type="button" variant="outline" className="w-full" onClick={() => setIsImportCsvOpen(true)}>
                                    Import from JSON
                                </Button>
                            </div>

                            <DialogFooter className="flex-row justify-end space-x-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Continue
                                </Button>
                            </DialogFooter>
                        </div>
                        <div className="hidden md:block relative">
                            <Image src="/Parallax2.jpg" alt="A musician performing on stage" fill style={{objectFit: 'cover'}} className="rounded-r-lg" />
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
        <ImportCsvDialog
            isOpen={isImportCsvOpen}
            onClose={() => setIsImportCsvOpen(false)}
            onImport={handleCsvImport}
        />
        </>
    );
}
