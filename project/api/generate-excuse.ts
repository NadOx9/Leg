import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getPromptByType = (type: string) => {
  switch (type) {
    case 'serious':
      return "You are Alibi AI, specialized in creating professional and believable excuses. Your responses should be formal, realistic, and appropriate for business or serious situations. Focus on credible scenarios that would be acceptable in a professional context. Keep responses under 50 words.";
    case 'cheeky':
      return "You are Alibi AI, specialized in creating bold but plausible excuses. Your responses should be clever, slightly audacious, but still maintainable. Add a touch of wit while keeping it believable. Keep responses under 50 words.";
    case 'funny':
      return "You are Alibi AI, specialized in creating humorous and creative excuses. Your responses should be witty, imaginative, and entertaining. Feel free to be more playful and use amusing scenarios. Keep responses under 50 words.";
    default:
      return "You are Alibi AI, specialized in creating believable excuses. Your responses should be concise, realistic, and appropriate for the situation. Keep responses under 50 words.";
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reason, type = 'serious' } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: getPromptByType(type)
        },
        {
          role: "user",
          content: `I need an excuse for: ${reason}`
        }
      ],
      temperature: type === 'serious' ? 0.3 : 0.7,
      max_tokens: 100
    });

    const excuse = completion.choices[0].message.content.trim();
    return res.status(200).json({ excuse });
  } catch (error: any) {
    console.error('Error generating excuse:', error);

    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Invalid OpenAI API key' });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    return res.status(500).json({
      error: 'Failed to generate excuse',
      details: error.message
    });
  }
}