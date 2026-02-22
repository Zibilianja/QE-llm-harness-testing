import type { ChatStore, ChatSettings, ChatMessage } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const uid = (prefix = 'm') => {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
};

const defaultSettings: ChatSettings = {
  model: 'gpt-4.1-mini',
  temperature: 0.3,
  maxTokens: 800,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      settings: defaultSettings,
      status: 'idle',
      lastResult: null,
      provider: 'openai',
      error: null,

      addMessage: (role, content) => {
        const msg: ChatMessage = {
          id: uid(role === 'assistant' ? 'a' : role === 'user' ? 'u' : 's'),
          role,
          content,
          createdAt: Date.now(),
        };
        set({ messages: [...get().messages, msg] });
      },

      updateMessage: (id, patch) => {
        set({
          messages: get().messages.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        });
      },

      removeMessage: (id) => {
        set({ messages: get().messages.filter((m) => m.id !== id) });
      },

      clearMessages: () => {
        set({ messages: [], lastResult: null, status: 'idle' });
      },

      setSettings: (patch) => {
        set({ settings: { ...get().settings, ...patch } });
      },

      setStatus: (status) => set({ status }),
      setLastResult: (lastResult) => set({ lastResult }),

      setProvider: (provider) => set({ provider }),
      setError: (error) => set({ error }),

      hydrateFrom: (messages) => set({ messages }),
    }),
    {
      name: 'chat-store-v1',
      partialize: (state) => ({
        messages: state.messages,
        settings: state.settings,
        provider: state.provider,
        error: state.error,
      }),
    },
  ),
);
