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
import { createCommunity, exportCommunity } from '@/app/actions';
import ImportCsvDialog from './import-csv-dialog';

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
    const [isImporting, setIsImporting] = useState(false);
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>(iconOptions[0]);
    const iconInputRef = useRef<HTMLInputElement>(null);
    
    const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);


    const handleBannerDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0], 'banner');
        }
    };

    const handleFileChange = (file: File, type: 'banner' | 'icon') => {
        if (file && file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            if (type === 'banner') {
                setBannerFile(file);
                setBannerPreview(previewUrl);
            } else {
                setIconFile(file);
                setIconPreview(previewUrl);
            }
        }
    };

    const handleIconOptionClick = (iconUrl: string) => {
        setIconPreview(iconUrl);
        setIconFile(null); // Clear file if pre-selected one is chosen
    };
    
    const handleCsvImport = async (communityData: any, members: any[]) => {
      setIsImporting(true);
      startTransition(async () => {
        try {
            const result = await exportCommunity(communityData, members);
            if (result.success) {
                toast({ title: 'Import Successful', description: result.message });
                onSuccess(communityData);
            } else {
                toast({ variant: 'destructive', title: 'Import Failed', description: result.message });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Import Error', description: error.message });
        } finally {
            setIsImporting(false);
            onClose();
        }
      });
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a community.' });
            return;
        }

        const formData = new FormData(event.currentTarget);

        // If name is empty, create a default community
        if (!formData.get('name')) {
            const defaultName = `My Awesome Community #${Math.floor(Math.random() * 1000)}`;
            formData.set('name', defaultName);
            formData.set('description', `This is a default community called ${defaultName}. We are awesome.`);
        }

        formData.append('userId', user.uid);
        formData.append('userEmail', user.email || '');
        formData.append('userName', user.displayName || '');
        
        startTransition(async () => {
            const result = await createCommunity(formData);
            if (result.success && result.community) {
                toast({ title: 'Community Created', description: result.message });
                onSuccess(result.community);
                onClose();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message || 'Failed to create community.' });
            }
        });
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setLocation('');
        setWebsite('');
        setIsPublic(true);
        setBannerFile(null);
        setBannerPreview(null);
        setIconFile(null);
        setIconPreview(iconOptions[0]);
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
                <form onSubmit={handleSubmit} ref={formRef}>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 flex flex-col gap-6">
                            <div>
                                <DialogTitle className="text-2xl font-bold font-headline">Your Community Details</DialogTitle>
                                <DialogDescription>Create a new community and start building. Leave name blank to create a default one.</DialogDescription>
                            </div>
                            
                            <div 
                                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                                onDrop={handleBannerDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => bannerInputRef.current?.click()}
                            >
                                {bannerPreview ? (
                                    <Image src={bannerPreview} alt="Banner preview" width={300} height={100} className="w-full h-24 object-cover rounded-md" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <CloudUpload size={32} />
                                        <p>Drag and drop banner image here, or click to browse</p>
                                    </div>
                                )}
                                <input type="file" ref={bannerInputRef} onChange={(e) => e.target.files && handleFileChange(e.target.files[0], 'banner')} className="hidden" accept="image/*" name="bannerImage" />
                            </div>
                            
                            <div className="flex items-center justify-center gap-2">
                                {iconOptions.map(icon => (
                                    <button key={icon} type="button" onClick={() => handleIconOptionClick(icon)}>
                                        <Image src={icon} alt="Icon option" width={40} height={40} className={`rounded-full border-2 ${iconPreview === icon && !iconFile ? 'border-primary' : 'border-transparent'}`} />
                                    </button>
                                ))}
                                <button type="button" className="flex flex-col items-center text-muted-foreground hover:text-primary" onClick={() => iconInputRef.current?.click()}>
                                    <ImageIcon size={24} />
                                    <span className="text-xs">Browse</span>
                                </button>
                                 <input type="file" ref={iconInputRef} onChange={(e) => e.target.files && handleFileChange(e.target.files[0], 'icon')} className="hidden" accept="image/*" name="iconImage"/>
                            </div>

                            <Input name="name" placeholder="Your Community Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <Textarea name="description" placeholder="Describe your community" value={description} onChange={(e) => setDescription(e.target.value)} />
                            <Input name="location" placeholder="Location (City, Country)" value={location} onChange={(e) => setLocation(e.target.value)} />
                            <Input name="website" placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
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
                                <Button type="submit" disabled={isPending || isImporting}>
                                    {isPending || isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
