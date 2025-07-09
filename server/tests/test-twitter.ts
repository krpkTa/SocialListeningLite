import { XService } from "../services/x.service";
import dotenv from 'dotenv';
import { BaseSearchParams} from "../services/interfaces/search-params";

dotenv.config();

async function testTwitterService() {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
        console.error('Error: TWITTER_BEARER_TOKEN not found in .env');
        return;
    }

    const twitterService = new XService(bearerToken);

    const searchParams: BaseSearchParams = {
        query: 'google',
        limit: 10
    };

    try {
        const posts = await twitterService.fetchPosts(searchParams);
        console.log(`Was found posts: ${posts.length}`);

        posts.forEach((post, index) => {
            console.log(`\nПост ${index + 1}:`);
            console.log(`ID: ${post.id}`);
            console.log(`Контент: ${post.content}`);
            console.log(`Дата создания: ${post.createdAt}`);
            console.log(`Платформа: ${post.platform}`);
            console.log('------------------------');
        });
    } catch (error) {
        console.error('Error in testing: ', error);
    }
}

testTwitterService();