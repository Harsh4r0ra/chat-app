import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LogOut, Send, User, Loader2 } from 'lucide-react';

const Chat = ({ session }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const supabase = createClientComponentClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
      scrollToBottom();
    };

    fetchMessages();

    const channel = supabase
      .channel('message_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(current => [...current, payload.new]);
            scrollToBottom();
          } else if (payload.eventType === 'DELETE') {
            setMessages(current => 
              current.filter(message => message.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setMessages(current =>
              current.map(message =>
                message.id === payload.new.id ? payload.new : message
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsTyping(true);
    try {
      const { error } = await supabase.from('messages').insert([
        {
          content: newMessage,
          user_id: session.user.id,
          username: session.user.email,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <User className="text-white" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">
                {session.user.email}
              </p>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat Room</h1>
              <p className="text-sm text-gray-500 mt-1">
                {messages.length} messages in conversation
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user_id === session.user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.user_id === session.user.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-white text-gray-800'
                } shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`h-8 w-8 rounded-full ${
                    message.user_id === session.user.id
                      ? 'bg-blue-400'
                      : 'bg-gray-100'
                  } flex items-center justify-center`}>
                    <User size={14} className={
                      message.user_id === session.user.id
                        ? 'text-white'
                        : 'text-gray-500'
                    } />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      message.user_id === session.user.id
                        ? 'text-blue-100'
                        : 'text-gray-900'
                    }`}>
                      {message.username}
                    </p>
                    <p className={`text-xs ${
                      message.user_id === session.user.id
                        ? 'text-blue-200'
                        : 'text-gray-500'
                    }`}>
                      {formatTimestamp(message.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-base leading-relaxed break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="bg-white shadow-lg p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-xl border-2 border-gray-200 px-6 py-3 text-gray-700 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isTyping}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-8 py-3 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isTyping ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              <span className="font-medium">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;