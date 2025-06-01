"use client"
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { PaperAirplaneIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/solid';

type Message = {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      text: input.trim(), 
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim(); 
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: currentInput 
      }, {
        timeout: 30000, 
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const aiMessage: Message = { 
        text: response.data.response, 
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.response?.status === 400) {
          errorMessage = 'Invalid message format. Please check your input.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (!error.response) {
          errorMessage = 'Cannot connect to the server. Please check if the backend is running.';
        }
      }
      
      const errorMsg: Message = { 
        text: errorMessage, 
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(part => part); 
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) { 
        return <strong key={i} className="font-semibold text-purple-300">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) { 
        return (
          <code key={i} className="bg-purple-900/30 text-purple-200 px-2 py-1 rounded-lg text-sm font-mono border border-purple-700/30">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part; 
    });
  };

  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      const headerMatch = line.match(/^\s*\*\*(.+?)\*\*\s*$/);
      if (headerMatch && headerMatch[1].trim() !== "") {
        return (
          <h3 key={index} className="font-bold text-xl mt-6 mb-3 text-purple-200 border-l-4 border-purple-400 pl-4">
            {headerMatch[1].trim()}
          </h3>
        );
      }
      
      if (/^\s{2,}\* /.test(line)) {
        const content = line.replace(/^\s{0,}\* /, '');
        return (
          <li key={index} className="ml-8 mb-2 text-gray-300 text-sm list-disc marker:text-purple-400">
            {parseInlineFormatting(content)}
          </li>
        );
      }
      
      if (trimmedLine.startsWith('* ')) {
        const content = trimmedLine.slice(2);
        return (
          <li key={index} className="ml-4 mb-2 text-gray-200 list-disc marker:text-purple-400">
            {parseInlineFormatting(content)}
          </li>
        );
      }

      if (/^\s*\d+\.\s/.test(line)) {
        const content = line.replace(/^\s*\d+\.\s*/, '');
        return (
          <li key={index} className="ml-4 mb-2 text-gray-200 list-decimal marker:text-purple-400">
            {parseInlineFormatting(content)}
          </li>
        );
      }

      if (trimmedLine) {
        return (
          <p key={index} className="mb-3 text-gray-200 leading-relaxed">
            {parseInlineFormatting(line)} 
          </p>
        );
      }
      
      return <div key={index} className="mb-3"></div>;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-black relative">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)'
        }}></div>
      </div>
      
      <header className="relative bg-gray-900/90 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <p className="text-purple-300 text-sm">Powered by Google Gemini</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-6 py-3 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl transition-all duration-300 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-6 overflow-hidden relative min-h-0">
        <div className="h-full flex flex-col bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide relative" style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {messages.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/25">
                    <span className="text-white font-bold text-3xl">AI</span>
                  </div>
                  <h2 className="text-3xl font-semibold text-white mb-4 text-center">
                    How can I help you today?
                  </h2>
                  <p className="text-gray-300 text-lg text-center">
                    Ask me anything! I'm here to help with questions, explanations, and more.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-4xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/25' 
                          : 'bg-gradient-to-r from-purple-500 to-violet-500 shadow-purple-500/25'
                      }`}>
                        <span className="text-white font-semibold text-sm">
                          {message.sender === 'user' ? 'You' : 'AI'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col flex-1">
                        <div
                          className={`rounded-2xl px-6 py-4 shadow-xl backdrop-blur-sm border ${
                            message.sender === 'user' 
                              ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white ml-12 border-blue-400/40' 
                              : 'bg-gray-800/90 border-purple-500/30 text-gray-100 mr-12'
                          }`}
                        >
                          <div className="prose prose-sm max-w-none">
                            {message.sender === 'ai' ? (
                              <div className="space-y-2">
                                {formatMessage(message.text)}
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap break-words">
                                {message.text}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className={`flex items-center space-x-1 mt-2 text-xs text-purple-400 ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <span className="text-white font-semibold text-sm">AI</span>
                      </div>
                      <div className="bg-gray-800/90 backdrop-blur-sm border border-purple-500/30 rounded-2xl px-6 py-4 shadow-xl">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <span className="text-sm text-purple-200">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-purple-500/30 bg-gray-900/90 backdrop-blur-xl p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500/40 text-red-200 rounded-xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full border border-purple-500/40 bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  disabled={isLoading}
                  maxLength={1000}
                />
                <div className="flex justify-between mt-2">
                  <div className="text-xs text-purple-400">
                    {input.length}/1000 characters
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-2xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40"
                title="Send message"
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}