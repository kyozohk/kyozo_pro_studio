'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Globe, Users, MapPin, Dot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Community {
    id: string;
    name: string;
    description: string;
    memberCount?: number;
    location?: string;
    category?: string;
    visibility?: 'public' | 'private';
    lastActivity?: Date;
    newMembersThisMonth?: number;
    profile?: {
      bannerUrl?: string;
      logoUrl?: string;
    };
  }
  
interface CommunityCardProps {
    community: Community;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'C';
    const names = name.split(' ');
    return names
      .map(n => n[0])
      .join('')
      .toUpperCase();
};

export default function CommunityCard({ community }: CommunityCardProps) {
    const lastActivity = community.lastActivity ? formatDistanceToNow(community.lastActivity, { addSuffix: true }) : 'No activity';

    return (
        <div className="group relative rounded-2xl bg-card p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-primary/20 focus-within:shadow-primary/20">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/50 to-purple-500/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" style={{padding: '1px'}}>
                <div className="h-full w-full rounded-[15px] bg-card" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <Avatar className="h-12 w-12 text-xl border-2 border-card">
                        <AvatarImage src={community.profile?.logoUrl} alt={community.name} />
                        <AvatarFallback>{getInitials(community.name)}</AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className={cn("capitalize", community.visibility === 'public' && "border-border/50")}>
                        <Globe className="mr-1 h-3 w-3" />
                        {community.visibility || 'Private'}
                    </Badge>
                </div>
                
                {/* Body */}
                <div className="flex-grow">
                    <h3 className="text-lg font-bold font-headline truncate">{community.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{community.description}</p>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{community.memberCount || 0} members</span>
                        </div>
                        {community.location && (
                             <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-red-400" />
                                <span>{community.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border/10">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-muted-foreground">
                             <Dot className="h-6 w-6 text-green-500 animate-pulse" />
                             <span>Active {lastActivity}</span>
                        </div>
                        <span className="text-green-400 font-semibold">
                            +{community.newMembersThisMonth || 0} this month
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
