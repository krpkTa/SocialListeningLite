import dotenv from "dotenv";
import { YouTubeService} from "../services/youtube.service";
import { BaseSearchParams } from "../services/interfaces/search-params";

dotenv.config()

async function TestYoutubeService(){
    const apiKey = process.env.YOUTUBE_KEY;

    if(!apiKey)
    {
        console.log('No API Key');
        return;
    }

    const youtubeService = new YouTubeService(apiKey)

    const params: BaseSearchParams = {
        query: 'AI'
    }

    try {
        const results = await  youtubeService.fetchPosts(params)
        console.log(`Найдено постов: ${results.length}`);

        results.forEach((post, index) => {
            console.log(`\nПост ${index + 1}:`);
            console.log(`ID: ${post.id}`);
            console.log(`Контент: ${post.content}`);
            console.log(`Дата создания: ${post.createdAt}`);
            console.log(`Платформа: ${post.platform}`);
            console.log('------------------------');
        })
    }catch (error) {
        console.error('Error: ', error);
    }
}

TestYoutubeService();