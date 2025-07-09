export interface BasePost {
    id: string;
    content: string;
    createdAt: Date;
    channelName?: string;
    //url?: string;
    platform: SocialPlatform;
}

export type SocialPlatform = 'x' | 'reddit' | 'youtube' | 'telegram';