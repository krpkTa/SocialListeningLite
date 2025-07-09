import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TelegramAuthService } from './services/telegram-auth.service';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const telegramAuth = new TelegramAuthService(
    Number(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH!
);

// Инициализация при запуске
telegramAuth.init().catch(console.error);

app.post('/auth/request-code', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Требуется номер телефона' });
        }

        await telegramAuth.connect();
        
        res.json({ success: true, message: 'Код отправлен' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при отправке кода' });
    }
});

app.post('/auth/verify-code', async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;
        if (!phoneNumber || !code) {
            return res.status(400).json({ error: 'Требуются номер телефона и код' });
        }

        await telegramAuth.authorize(phoneNumber, code);
        res.json({ success: true, message: 'Авторизация успешна' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при проверке кода' });
    }
});

app.get('/telegram/posts', async (req, res) => {
    try {
        const { channel, limit } = req.query;
        if (!channel) {
            return res.status(400).json({ error: 'Требуется указать канал' });
        }

        const posts = await telegramAuth.getPosts(channel.toString(), Number(limit) || 10);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении постов' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});