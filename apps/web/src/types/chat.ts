export type Role = 'system' | 'user' | 'assistant';
type Provider = 'openai' | 'anthropic';

export type ChatMessage = {
  role: Role;
  content: string;
};

export type ChatRunStatus = 'idle' | 'running' | 'error';

export type ChatRunResult = {
  text?: string;
  error?: string;
  latencyMs?: number;
};

export type RunChatRequest = {
  provider: Provider;
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>;
  model: string;
};

export type RunChatResponse = {
  text: string;
  latencyMs?: number;
};
