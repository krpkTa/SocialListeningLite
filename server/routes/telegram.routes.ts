import { Router } from 'express';
import { sendCode, signInWithCode, getPosts } from '../services/telegram.service';

const router = Router();

// Telegram step-by-step auth endpoints
router.post('/sendCode', async (req, res) => {
  const { phone } = req.body;
  try {
    const result = await sendCode(phone);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/signInWithCode', async (req, res) => {
  const { phone, code, phoneCodeHash, session, password } = req.body;
  try {
    const result = await signInWithCode({ phone, code, session, password });
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/getPosts', async (req, res) => {
  const { session, channelName, query, limit } = req.body;
  try {
    const result = await getPosts({ session, channelName, query, limit });
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router; 