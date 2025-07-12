import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram";

const apiIdEnv = process.env.TELEGRAM_API_ID;
const apiHashEnv = process.env.TELEGRAM_API_HASH;

if (!apiIdEnv || !apiHashEnv) {
    throw new Error("TELEGRAM_API_ID и TELEGRAM_API_HASH должны быть заданы в .env");
}

const API_ID = Number(apiIdEnv);
const API_HASH = apiHashEnv;

// 1. Отправка кода на телефон
export async function sendCode(phone: string) {
    const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 5 });
    await client.connect();
    const result = await client.sendCode({
        apiId:API_ID,
        apiHash:API_HASH,
    }, phone);

    return {
        phoneCodeHash: result.phoneCodeHash,
        session: client.session.save(),
    };
}

// 2. Подтверждение кода и (опционально) пароля 2FA
export async function signInWithCode({ phone, code, session, password }: { phone: string, code: string, session: string, password?: string }) {
    const client = new TelegramClient(new StringSession(session), API_ID, API_HASH, { connectionRetries: 5 });
    await client.connect();
    try {
        await client.start({
            phoneNumber: async () => phone,
            phoneCode: async () => code,
            password: async () => password || "",
            onError: (err) => { throw err; },
        });
        return {
            session: client.session.save(),
        };
    } catch (err: any) {
        // Проверяем текст ошибки (может отличаться, проверьте в логах!)
        if (err.message && err.message.includes("Password")) {
            return { error: "SESSION_PASSWORD_NEEDED" };
        }
        throw err;
    }
}

// 3. Получение постов
export async function getPosts({ session, channelName, query, limit = 100 }: { session: string, channelName: string, query: string, limit?: number }) {
    const client = new TelegramClient(new StringSession(session), API_ID, API_HASH, { connectionRetries: 5 });
    await client.connect();
    const entity = await client.getEntity(channelName);
    const messages = await client.getMessages(entity, { limit, reverse: true });
    return messages
        .filter((message: any) => message && message.text && message.text.toLowerCase().includes(query.toLowerCase()))
        .map((message: any) => ({
            id: message.id.toString(),
            content: message.text || '',
            createdAt: new Date(message.date * 1000),
            channelName,
            platform: 'telegram' as const
        }));
}
