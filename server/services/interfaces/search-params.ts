export interface BaseSearchParams
{
    query: string;
    limit?: number;
}
export interface RedditSearchParams extends BaseSearchParams
{
    subreddit: string;
}
export interface TelegramSearchParams extends BaseSearchParams{
    channelName: string;
}

export type SearchParams = | RedditSearchParams | TelegramSearchParams | BaseSearchParams;