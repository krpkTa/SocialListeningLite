import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


import { sendCode, signInWithCode, getPosts } from './services/telegram.service';

const app = express();
app.use(express.json());
app.use(cors());

// Telegram step-by-step auth endpoints
app.post('/api/telegram/sendCode', async (req, res) => {
  const { phone } = req.body;
  try {
    const result = await sendCode(phone);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/telegram/signInWithCode', async (req, res) => {
  const { phone, code, phoneCodeHash, session, password } = req.body;
  try {
    const result = await signInWithCode({ phone, code, session, password });
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/telegram/getPosts', async (req, res) => {
  const { session, channelName, query, limit } = req.body;
  try {
    const result = await getPosts({ session, channelName, query, limit });
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
