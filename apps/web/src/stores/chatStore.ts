import { create } from 'zustand';
import type { ChatStore, ChatMessage } from '@/types';

export const useChatStore = create<ChatStore>((set, get) => ({
  input: '',
  msgsByProvider: {
    openai: [],
    anthropic: [],
  },
  loading: false,
  error: null,
  provider: 'openai',
  model: 'gpt-4.1-mini',

  setInput: (v) => set({ input: v }),
  setProvider: (p) => set({ provider: p, error: null, input: '' }),

  setMsgs: (v) => {
    const p = get().provider;
    set((s) => {
      const prev = s.msgsByProvider[p];
      const next = typeof v === 'function' ? (v as any)(prev) : v;
      return {
        msgsByProvider: {
          ...s.msgsByProvider,
          [p]: next,
        },
      };
    });
  },
  setLoading: (v) => set({ loading: v }),
  setError: (v) => set({ error: v }),
  setModel: (v) => set({ model: v }),
  clearMsgsForProvider: (p) =>
    set((s) => ({
      msgsByProvider: { ...s.msgsByProvider, [p]: [] },
    })),
  clearAll: () =>
    set({
      input: '',
      loading: false,
      error: null,
      provider: 'openai',
      msgsByProvider: { openai: [], anthropic: [] },
    }),
}));
