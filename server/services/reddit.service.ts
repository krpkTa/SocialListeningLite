import { SocialMediaService } from "./interfaces/SocialMediaService-interface";
import { SearchParams, RedditSearchParams } from "./interfaces/search-params";
import { BasePost, SocialPlatform } from "./interfaces/base-post.interface";
import snoowrap from 'snoowrap';

export class RedditService implements SocialMediaService {
    readonly platform: SocialPlatform = 'reddit';
    private reddit: snoowrap;

    constructor(userAgent: string, clientId: string, clientSecret: string, username: string, password: string) {
        this.reddit = new snoowrap({
            userAgent,
            clientId,
            clientSecret,
            username,
            password
        });
    }

    async fetchPosts(params: SearchParams): Promise<BasePost[]> {
        if (!this.isRedditParams(params)) {
            throw new Error('Invalid params for Reddit service');
        }

        try {
            const results = await this.reddit
                .getSubreddit(params.subreddit)
                .search({
                    query: params.query,
                    sort: 'new',
                    time: 'week'
                });

            return results.map(post => ({
                id: post.id,
                content: post.title,
                url: post.url,
                createdAt: new Date(post.created_utc * 1000),
                platform: 'reddit' as const
            }));
        } catch (error) {
            console.error('Ошибка при получении постов Reddit:', error);
            throw error;
        }
    }

    private isRedditParams(params: SearchParams): params is RedditSearchParams {
        return 'subreddit' in params;
    }
}