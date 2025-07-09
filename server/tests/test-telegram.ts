import { TelegramService } from "../services/telegram.service";
import dotenv from 'dotenv';

dotenv.config();

async function testTelegramService() {
    const apiId = Number(process.env.TELEGRAM_API_ID);
    const apiHash = process.env.TELEGRAM_API_HASH;
    //Session создается после авторизации с помощью телеграм кода
    const session = process.env.TELEGRAM_SESSION;

    if (!apiId || !apiHash || !session) {
        console.error('Не все параметры для Telegram найдены в .env файле');
        return;
    }

    const telegramService = new TelegramService(
        apiId,
        apiHash,
        session
    );

    try {
        const searchParams = {
            query: "ГрГУ",
            channelName: "grsu_official",
            limit: 10
        };

        const posts = await telegramService.fetchPosts(searchParams);

        console.log(`Найдено сообщений: ${posts.length}`);
        posts.forEach((post, index) => {
            console.log(`\nСообщение ${index + 1}:`);
            console.log(`Канал: ${post.channelName}`);
            console.log(`Текст: ${post.content}`);
            console.log(`Дата: ${post.createdAt.toLocaleString('ru-RU')}`);
            console.log('------------------------');
        });
    } catch (error) {
        console.error('Ошибка при тестировании:', error);
    } finally {
        await telegramService.disconnect();
    }
}

testTelegramService();