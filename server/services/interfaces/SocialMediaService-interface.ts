import {SearchParams} from "./search-params";
import {SocialPlatform} from "./base-post.interface";
import {BasePost} from "./base-post.interface";

export interface SocialMediaService {
    readonly platform: SocialPlatform;
    fetchPosts(params: SearchParams): Promise<BasePost[]>;
}
