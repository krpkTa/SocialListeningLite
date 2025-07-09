import axios from 'axios';
import { BasePost } from "./interfaces/base-post.interface";
import { SocialMediaService } from "./interfaces/SocialMediaService-interface";
import { SearchParams } from "./interfaces/search-params";
import { SocialPlatform } from "./interfaces/base-post.interface";

export class YouTubeService implements SocialMediaService {
    readonly platform: SocialPlatform = 'youtube';
    private readonly apiKey: string;
    private readonly apiUrl = 'https://www.googleapis.com/youtube/v3/search';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async fetchPosts(params: SearchParams): Promise<BasePost[]> {
        if ('subreddit' in params) {
            throw new Error('Invalid params for YouTube service');
        }

        try {
            const response = await axios.get(this.apiUrl, {
                params: {
                    part: 'snippet',
                    q: params.query,
                    type: 'video',
                    maxResults: params.limit || 10,
                    key: this.apiKey
                }
            });

            return response.data.items.map((item: any) => ({
                id: item.id.videoId,
                content: item.snippet.title,
                description: item.snippet.description,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                createdAt: new Date(item.snippet.publishedAt),
                platform: 'youtube' as const,
                thumbnail: item.snippet.thumbnails.default.url
            }));
        } catch (error) {
            console.error('Error receiving YouTube videos:', error);
            throw error;
        }
    }
}