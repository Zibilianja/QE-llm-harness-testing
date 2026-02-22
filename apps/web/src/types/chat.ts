export type Role = 'system' | 'user' | 'assistant';
export type Provider = 'openai' | 'anthropic';

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

export type ChatSettings = {
  model: string;
  temperature: number;
  maxTokens: number;
};

export type ChatRunStatus = 'idle' | 'running' | 'error';

export type ChatRunResult = {
  outputText?: string;
  error?: string;
  latencyMs: number;
};

export type RunChatRequest = {
  provider: Provider;
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>;
  settings: ChatSettings;
};

export type RunChatResponse = {
  outputText: string;
  latencyMs?: number;
};
