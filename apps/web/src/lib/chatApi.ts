import type { RunChatRequest, RunChatResponse } from '@/types/chat';

const runChat = async (req: RunChatRequest): Promise<RunChatResponse> => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: req.messages,
      provider: req.provider,
      model: req.settings.model,
      temperature: req.settings.temperature,
      maxTokens: req.settings.maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
};

export default runChat;
