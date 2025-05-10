import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getPromptByType = (type: string) => {
  switch (type) {
    case 'serious':
      return "You are Alibi AI, specialized in creating professional and believable excuses...";
    case 'cheeky':
      return "You are Alibi AI, specialized in creating bold but plausible excuses...";
    case 'funny':
      return "You are Alibi AI, specialized in creating humorous and creative excuses...";
    default:
      return "You are Alibi AI, specialized in creating believable excuses...";
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { reason, type = 'serious' } = body || {};

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: getPromptByType(type) },
        { role: 'user', content: `I need an excuse for: ${reason}` }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const excuse = completion.choices[0].message.content.trim();
    return res.status(200).json({ excuse });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to generate excuse',
      message: error.message
    });
  }
}
