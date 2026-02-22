export type Provider = 'openai' | 'anthropic';
export type Role = 'system' | 'user' | 'assistant';
export type ApiMessage = { role: Role; content: string };

export type ChatResponse = {
  provider: Provider;
  model: string;
  text: string;
  latencyMs?: number;
};

const API_URL = 'http://localhost:8787/api/chat';

export const sendChat = async (args: {
  provider: Provider;
  messages: ApiMessage[];
  model?: string;
}): Promise<ChatResponse> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg =
      data?.error?.message ??
      (typeof data?.error === 'string' ? data.error : null) ??
      JSON.stringify(data?.error ?? data);
    throw new Error(msg);
  }

  return data as ChatResponse;
};
