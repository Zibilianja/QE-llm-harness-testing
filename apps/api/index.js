import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const Body = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    }),
  ),
  provider: z.enum(['openai', 'anthropic']).optional(),
  model: z.string().optional(),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const trimMessages = (messages, maxTurns = 2) => {
  const maxMessages = maxTurns * 2;

  const system = messages.filter((m) => m.role === 'system');
  const nonSystem = messages.filter((m) => m.role !== 'system');

  let recent = nonSystem.slice(-maxMessages);

  // never start with assistant
  if (recent[0]?.role === 'assistant') recent = recent.slice(1);

  return [...system.slice(-1), ...recent];
};

app.post('/api/chat', async (req, res) => {
  const start = Date.now();
  const parsed = Body.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.issues });

  const provider = parsed.data.provider ?? process.env.LLM_PROVIDER ?? 'openai';
  const messages = trimMessages(parsed.data.messages, 2);

  try {
    if (provider === 'openai') {
      const model =
        parsed.data.model ?? process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';

      // Responses API (recommended for new projects)
      const response = await openai.responses.create({
        model,
        input: messages.map((m) => ({
          role: m.role,
          content: [
            {
              type: m.role === 'assistant' ? 'output_text' : 'input_text',
              text: m.content,
            },
          ],
        })),
      });

      console.log(response.usage);

      const text = response.output_text ?? '';

      return res.json({
        provider,
        model,
        text,
        latencyMs: Date.now() - start,
      });
    }

    if (provider === 'anthropic') {
      const model =
        parsed.data.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

      // Anthropic Messages API
      const system = messages.find((m) => m.role === 'system')?.content;
      const userAndAssistant = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const msg = await anthropic.messages.create({
        model,
        max_tokens: 512,
        system,
        messages: userAndAssistant,
      });

      const text = msg.content?.[0]?.type === 'text' ? msg.content[0].text : '';

      return res.json({
        provider,
        model,
        text,
        latencyMs: Date.now() - start,
      });
    }

    return res.status(400).json({ error: 'Unknown provider' });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message ?? e) });
  }
});

app.listen(8787, () => console.log('API listening on http://localhost:8787'));
