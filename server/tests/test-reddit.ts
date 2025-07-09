import { RedditService } from "../services/reddit.service";
import { RedditSearchParams } from "../services/interfaces/search-params";
import dotenv from 'dotenv';

dotenv.config();

async function testRedditService() {
    const userAgent = process.env.REDDIT_USER_AGENT?.replace(/^'|'$/g, ''); // Удаляем кавычки из значения
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD?.replace(/\\\\/g, '\\'); // Исправляем двойные бэкслеши

    // Проверяем наличие всех необходимых параметров
    if (!userAgent || !clientId || !clientSecret || !username || !password) {
        console.error('Не все параметры для Reddit найдены в .env файле');
        return;
    }

    const redditService = new RedditService(
        userAgent,
        clientId,
        clientSecret,
        username,
        password
    );

    const searchParams: RedditSearchParams = {
        query: "AI",
        subreddit: "technology"
    };

    try {
        const posts = await redditService.fetchPosts(searchParams);
        console.log(`Найдено постов: ${posts.length}`);

        posts.forEach((post, index) => {
            console.log(`\nПост ${index + 1}:`);
            console.log(`Заголовок: ${post.content}`);
            //console.log(`URL: ${post.url}`);
            console.log(`Дата создания: ${post.createdAt}`);
            console.log('------------------------');
        });
    } catch (error) {
        console.error('Ошибка при тестировании:', error);
    }
}

testRedditService();