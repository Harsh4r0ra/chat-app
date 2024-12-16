'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export default function Chat({ session }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        payload => {
          setMessages(current => [...current, payload.new]);
        }
      )
      .subscribe();

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };

    fetchMessages();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from('messages').insert([
      {
        content: newMessage,
        user_id: session.user.id,
        username: session.user.email
      }
    ]);

    setNewMessage('');
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.user_id === session.user.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className="rounded bg-blue-100 p-2">
              <p className="text-sm text-gray-600">{message.username}</p>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded border p-2"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}