import type {
  ChatMessage,
  ChatRunResult,
  ChatRunStatus,
  ChatSettings,
  Role,
} from '@/types';

export type Provider = 'openai' | 'anthropic';

export type ChatStore = {
  messages: ChatMessage[];
  settings: ChatSettings;
  status: ChatRunStatus;
  lastResult: ChatRunResult | null;

  provider: Provider;
  error: string | null;

  addMessage: (role: Role, content: string) => void;
  updateMessage: (
    id: string,
    patch: Partial<Pick<ChatMessage, 'content'>>,
  ) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;

  setSettings: (patch: Partial<ChatSettings>) => void;

  setStatus: (status: ChatRunStatus) => void;
  setLastResult: (result: ChatRunResult | null) => void;

  setProvider: (provider: Provider) => void;
  setError: (error: string | null) => void;

  hydrateFrom: (messages: ChatMessage[]) => void;
};
