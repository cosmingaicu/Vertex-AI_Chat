import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function TypingIndicator() {
  return (
    <div className="msg-row ai">
      <div className="msg-avatar ai-avatar">AI</div>
      <div className="typing-indicator">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`msg-row ${msg.role}`}>
      <div className={`msg-avatar ${isUser ? 'user-avatar' : 'ai-avatar'}`}>
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="msg-col">
        <div className="bubble">{msg.content}</div>
        <div className="timestamp">{msg.timestamp}</div>
      </div>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey! How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  };

  const now = () =>
    new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, timestamp: now() };
    const currentHistory = [...messages];

    setMessages([...currentHistory, userMessage]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    const assistantMessage = { role: 'assistant', content: '', timestamp: now() };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: currentHistory,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, content: last.content + chunk };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching chat stream:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Something went wrong. Please try again.',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = ['Explain streaming', 'Write a poem', 'Summarize something'];

  return (
    <div className="chat-shell">
      <div className="chat-container">
        <header className="chat-header">
          <div className="header-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 4-3 6-4 8H9c-1-2-4-4-4-8a7 7 0 0 1 7-7z" />
              <path d="M9 17h6M10 21h4" />
            </svg>
          </div>
          <div className="header-info">
            <span className="header-title">AI Assistant</span>
            <span className="header-status">
              <span className="status-dot" />
              Online
            </span>
          </div>
        </header>

        <div className="message-list">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <TypingIndicator />
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="suggestion-chips">
            {suggestions.map((s) => (
              <button
                key={s}
                className="chip"
                onClick={() => {
                  setInput(s);
                  textareaRef.current?.focus();
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="input-area">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            placeholder="Message AI…"
            disabled={isLoading}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
