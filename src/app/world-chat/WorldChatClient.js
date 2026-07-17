'use client';
import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { api } from '@/lib/api';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

export default function WorldChatClient() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    setLoggedIn(api.isLoggedIn());
    setUser(api.user);
    fetchMessages();

    if (PUSHER_KEY) {
      const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
      const channel = pusher.subscribe('chat-room');
      channel.bind('new-message', (data) => {
        setMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      });
      return () => {
        channel.unbind_all();
        pusher.unsubscribe('chat-room');
        pusher.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    try {
      const data = await api.getChatMessages();
      setMessages(data.reverse());
    } catch {}
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setMsg('');
    try {
      await api.sendChatMessage(input.trim());
      setInput('');
    } catch { setMsg('Failed to send'); }
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-16 px-5 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] bg-clip-text text-transparent mb-6 text-center">
          World Chat
        </h1>

        {!PUSHER_KEY && (
          <div className="glass p-3 rounded-xl mb-4 text-xs text-center text-[#f1c40f]">
            WebSocket not configured — using fallback polling. Add NEXT_PUBLIC_PUSHER_KEY to enable real-time.
          </div>
        )}

        {msg && <div className="glass p-3 rounded-xl mb-4 text-sm text-center text-[#ff6b6b]" role="alert">{msg}</div>}

        <div className="glass flex-1 rounded-xl p-4 mb-4 overflow-y-auto flex flex-col gap-2" style={{ maxHeight: '60vh', minHeight: '300px' }} role="log" aria-live="polite" aria-label="Chat messages">
          {messages.length === 0 ? (
            <div className="text-[#7777aa] text-center py-8">No messages yet. Be the first!</div>
          ) : (
            messages.map(m => (
              <div key={m.id} className="glass-hover p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center text-[10px] font-bold flex-shrink-0" aria-hidden="true">
                    {m.username?.[0]?.toUpperCase() || '?'}
                  </span>
                  <span className="text-sm font-bold text-[#00d4ff]">{m.username}</span>
                  <span className="text-[10px] text-[#5555aa] ml-auto">{formatTime(m.created_at)}</span>
                </div>
                <p className="text-sm text-[#ccc] break-words pl-8">{m.message}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {loggedIn ? (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="input-field flex-1"
              placeholder="Type a message..."
              maxLength={500}
              aria-label="Chat message"
            />
            <button type="submit" className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap">
              Send
            </button>
          </form>
        ) : (
          <div className="text-center text-[#7777aa] text-sm glass p-4 rounded-xl">
            <a href="/login" className="text-[#00d4ff] underline">Login</a> to send messages
          </div>
        )}
      </div>
    </div>
  );
}
