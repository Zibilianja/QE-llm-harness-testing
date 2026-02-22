import type { ChatMessage } from '@/types';

export type Provider = 'openai' | 'anthropic';

export type ChatStore = {
  input: string;
  msgsByProvider: Record<Provider, ChatMessage[]>;
  loading: boolean;
  error: string | null;

  provider: Provider;
  model: string;

  setInput: (v: string) => void;
  setMsgs: (
    v: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => void;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;

  setProvider: (v: Provider) => void;
  setModel: (v: string) => void;
  clearMsgsForProvider: (p: Provider) => void;
  clearAll: () => void;
};
