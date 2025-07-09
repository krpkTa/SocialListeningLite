import axios from 'axios';
import { BasePost } from "./interfaces/base-post.interface";
import { SocialMediaService } from "./interfaces/SocialMediaService-interface";
import { SearchParams } from "./interfaces/search-params";
import { SocialPlatform } from "./interfaces/base-post.interface";

export class XService implements SocialMediaService {
    readonly platform: SocialPlatform = 'x';
    private readonly bearerToken: string;
    private readonly apiUrl = 'https://api.twitter.com/2/tweets/search/recent';

    constructor(bearerToken: string) {
        this.bearerToken = bearerToken;
    }

    async fetchPosts(params: SearchParams): Promise<BasePost[]> {
        // Проверяем, что это не RedditSearchParams
        // FIX IT!!!!!
        if ('subreddit' in params) {
            throw new Error('Invalid params for Twitter service');
        }

        try {
            const response = await axios.get(this.apiUrl, {
                headers: {
                    Authorization: `Bearer ${this.bearerToken}`,
                },
                params: {
                    query: params.query,
                    max_results: params.limit || 10,
                    'tweet.fields': 'created_at,text'
                }
            });

            return response.data.data.map((tweet: any) => ({
                id: tweet.id,
                content: tweet.text,
                createdAt: new Date(tweet.created_at),
                platform: 'x' as const
            }));
        } catch (error) {
            console.error('Error receiving tweets: ', error);
            throw error;
        }
    }
}
