import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI with the provided API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

const getPromptByType = (type) => {
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

// API endpoint to generate excuses
app.post('/api/generate-excuse', async (req, res) => {
  console.log('Received request:', req.body);
  
  try {
    const { reason, type = 'serious' } = req.body;
    
    if (!reason) {
      console.log('Error: Missing reason in request');
      return res.status(400).json({ error: 'Reason is required' });
    }

    console.log('Generating excuse for type:', type);

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
    console.log('Generated excuse:', excuse);
    
    res.json({ excuse });
  } catch (error) {
    console.error('Error generating excuse:', error);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Invalid OpenAI API key' });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate excuse',
      details: error.message
    });
  }
});

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('OpenAI API key is configured:', !!process.env.OPENAI_API_KEY);
});

export default app;