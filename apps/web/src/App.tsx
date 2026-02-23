import './App.css';

import { useMemo, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { sendChat } from '../../api/llmClient';
import type { ChatMessage } from './types';

const SYSTEM_PROMPT = 'You are a helpful assistant.';

const App = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // store state
  const input = useChatStore((s) => s.input);
  const msgs = useChatStore((s) => s.msgsByProvider[s.provider]);
  const loading = useChatStore((s) => s.loading);
  const error = useChatStore((s) => s.error);
  const provider = useChatStore((s) => s.provider);

  // store setters
  const setInput = useChatStore((s) => s.setInput);
  const setMsgs = useChatStore((s) => s.setMsgs);
  const setLoading = useChatStore((s) => s.setLoading);
  const setError = useChatStore((s) => s.setError);
  const setProvider = useChatStore((s) => s.setProvider);
  const clearMsgsForProvider = useChatStore((s) => s.clearMsgsForProvider);

  const model = useMemo(() => {
    return provider === 'openai' ? 'gpt-4.1-mini' : 'claude-sonnet-4-6';
  }, [provider]);

  const focusInput = () =>
    requestAnimationFrame(() => inputRef.current?.focus());

  const trimMessages = (messages: ChatMessage[], maxMessages: number) => {
    if (messages.length > maxMessages) {
      return messages.slice(messages.length - maxMessages);
    }
    return messages;
  };

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setError(null);
    setLoading(true);

    setMsgs((m) => [...m, { role: 'user', content: prompt }]);
    setInput('');
    focusInput();

    try {
      const { msgsByProvider: freshMsgs, provider: p } =
        useChatStore.getState();
      const trimmedMsgs = trimMessages(freshMsgs[p], 4);

      const apiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...trimmedMsgs,
      ];

      const resp = await sendChat({
        provider: p,
        model, // derived from provider (not user-editable)
        messages: apiMessages,
      });

      setMsgs((prev) => [
        ...prev,
        { role: 'assistant', content: resp.text ?? '' },
      ]);
    } catch (e: any) {
      setError(e?.message ?? 'Request failed');
    } finally {
      setLoading(false);
      focusInput();
    }
  };

  return (
    <div className='app-container'>
      <h1 className='title'>Chat QA Playground</h1>
      <div className='chat-container'>
        <label className='provider-label'>
          Provider:&nbsp;
          <select
            value={provider}
            className='provider-select'
            onChange={(e) => setProvider(e.target.value as any)}
          >
            <option value='openai'>OpenAI</option>
            <option value='anthropic'>Claude</option>
          </select>
        </label>

        <div className='model-info'>
          Using model: <code className='model-name'>{model}</code>
          {msgs.length > 0 && (
            <button
              className='clear-messages'
              onClick={() => clearMsgsForProvider(provider)}
            >
              Clear Messages
            </button>
          )}
        </div>
        <div
          data-testid='chat-thread'
          className='chat-thread'
        >
          <div className='chat-messages'>
            {msgs.map((m, i) => (
              <div
                key={i}
                data-testid={`msg-${m.role}`}
                className='chat-message'
              >
                <strong
                  className={
                    m.role == 'user'
                      ? 'chat-message-user'
                      : 'chat-message-assistant'
                  }
                >
                  {m.role.charAt(0).toUpperCase() + m.role.slice(1)}:
                </strong>{' '}
                {m.content}
              </div>
            ))}
            {loading && (
              <div
                data-testid='loading'
                className='loading'
              >
                Loading…
              </div>
            )}
            {error && <div data-testid='error'>Error: {error}</div>}
          </div>
        </div>

        <div className='chat-input-container'>
          <input
            ref={inputRef}
            data-testid='chat-input'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder='Ask something…'
            className='chat-input'
            disabled={loading}
          />
          <button
            data-testid='send-btn'
            className='send-btn'
            onClick={send}
            disabled={loading}
            type='button'
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
