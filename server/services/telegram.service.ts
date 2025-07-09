import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram";
import { SocialMediaService } from "./interfaces/SocialMediaService-interface";
import { BasePost } from "./interfaces/base-post.interface";
import { SearchParams, TelegramSearchParams } from "./interfaces/search-params";
import { SocialPlatform } from "./interfaces/base-post.interface";
import fs from "fs/promises";

export class TelegramService implements SocialMediaService {
    readonly platform: SocialPlatform = 'telegram';
    private readonly client: TelegramClient;
    private readonly maxRetries: number = 3;
    private readonly reconnectDelay: number = 1000;
    private isInitialized: boolean = false;

    constructor(
        apiId: number,
        apiHash: string,
        session: string,
    ) {
        if (!apiId || !apiHash) {
            throw new Error('API ID и API Hash обязательны для инициализации');
        }

        const stringSession = new StringSession(session || '');
        this.client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
            autoReconnect: true,
            retryDelay: 1000,
            deviceModel: 'Desktop',
            systemVersion: 'Windows',
            appVersion: '1.0.0',
            langCode: 'en',
            systemLangCode: 'en'
        });
    }

    async init(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            await this.client.connect();

            if (!await this.client.isUserAuthorized()) {
                throw new Error('Пользователь не авторизован. Требуется интерактивная авторизация.');
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Ошибка при инициализации:', error);
            throw error;
        }
    }

    async fetchPosts(params: SearchParams): Promise<BasePost[]> {
        if (!this.isInitialized) {
            await this.init();
        }

        if (!this.isTelegramParams(params)) {
            throw new Error('Неверные параметры для Telegram сервиса');
        }

        return await this.retryOperation(async () => {
            try {
                if (!params.channelName) {
                    throw new Error('Не указано имя канала');
                }

                const chat = await this.client.getEntity(params.channelName);
                if (!chat) {
                    throw new Error(`Канал ${params.channelName} не найден`);
                }

                const messages = await this.client.getMessages(chat, {
                    limit: params.limit || 100,
                    reverse: true
                });

                return messages
                    .filter(message => message && message.text &&
                        message.text.toLowerCase().includes(params.query.toLowerCase()))
                    .map(message => ({
                        id: message.id.toString(),
                        content: message.text || '',
                        createdAt: new Date(message.date * 1000),
                        channelName: params.channelName,
                        platform: 'telegram' as const
                    }));
            } catch (error) {
                console.error("Ошибка при получении сообщений:", error);
                throw error;
            }
        });
    }

    private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;
                console.error(`Попытка ${attempt} из ${this.maxRetries} не удалась:`, error.message);

                if (attempt < this.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
                    await this.reconnect();
                }
            }
        }

        throw lastError || new Error('Превышено количество попыток');
    }

    private async reconnect(): Promise<void> {
        this.isInitialized = false;
        try {
            await this.client.disconnect();
            await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
            await this.init();
        } catch (error) {
            console.error('Ошибка при переподключении:', error);
            throw error;
        }
    }

    public isTelegramParams(params: SearchParams): params is TelegramSearchParams {
        return 'channelName' in params;
    }

    async disconnect(): Promise<void> {
        if (this.isInitialized) {
            await this.client.disconnect();
            this.isInitialized = false;
        }
    }
}
