import React, { useState } from 'react';
import { LogOut, Send, User, MessageSquare } from 'lucide-react';

const Chat = ({ session }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSignOut = () => {
    // Sign out logic here
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Message sending logic here
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
                <User className="text-white" size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                {session?.user?.email || 'User'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center">
              <MessageSquare className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat Room</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                0 messages in conversation
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Messages will go here */}
        </div>

        {/* Message Input */}
        <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-xl border-2 border-gray-200 px-6 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-medium flex items-center gap-2 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 shadow-lg shadow-violet-500/25"
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;