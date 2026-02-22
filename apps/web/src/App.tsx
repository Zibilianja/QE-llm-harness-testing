import { useMemo, useState } from 'react';
import './App.css';

import { useChatStore } from '@/stores/chatStore';
import runChat from '@/lib/chatApi';

const SYSTEM_PROMPT = 'You are a helpful assistant.';

const App = () => {
  const [input, setInput] = useState('');

  // store state
  const msgs = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const error = useChatStore((s) => s.error);
  const provider = useChatStore((s) => s.provider);
  const settings = useChatStore((s) => s.settings);

  // store actions
  const addMessage = useChatStore((s) => s.addMessage);
  const setStatus = useChatStore((s) => s.setStatus);
  const setLastResult = useChatStore((s) => s.setLastResult);
  const setError = useChatStore((s) => s.setError);
  const setProvider = useChatStore((s) => s.setProvider);

  const loading = status === 'running';

  const model = useMemo(() => {
    // you can also just use settings.model if you want
    return provider === 'openai' ? 'gpt-4.1-mini' : 'claude-sonnet-4-6';
  }, [provider]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    // optimistic
    setInput('');
    setError(null);
    addMessage('user', prompt);
    setStatus('running');
    setLastResult(null);

    const start = performance.now();

    try {
      const { messages } = useChatStore.getState();

      const apiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const resp = await runChat({
        messages: apiMessages,
        provider,
        settings: {
          model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        },
      });

      addMessage('assistant', resp.text ?? resp.outputText ?? '');

      setLastResult({
        latencyMs: Math.round(performance.now() - start),
      });

      setStatus('idle');
    } catch (e: any) {
      const msg = e?.message ?? 'Request failed';
      setError(msg);
      setLastResult({ error: msg });
      setStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <h1>Chat QA Playground</h1>

      <label style={{ display: 'block', marginBottom: 8 }}>
        Provider:&nbsp;
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as any)}
        >
          <option value='openai'>OpenAI</option>
          <option value='anthropic'>Claude</option>
        </select>
      </label>

      <div
        data-testid='chat-thread'
        style={{ border: '1px solid #ccc', padding: '1rem', minHeight: 220 }}
      >
        {msgs.map((m) => (
          <div
            key={m.id}
            data-testid={`msg-${m.role}`}
            style={{ marginBottom: 12 }}
          >
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
        {loading && <div data-testid='loading'>Loading…</div>}
        {error && <div data-testid='error'>Error: {error}</div>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          data-testid='chat-input'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder='Ask something…'
          style={{ flex: 1, padding: 8 }}
        />
        <button
          data-testid='send-btn'
          onClick={send}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
