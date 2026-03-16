import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { createDiscoveryChat, ProxyChat } from '../services/geminiService';
import { GenerateContentResponse } from "@google/genai";

interface ChatInterfaceProps {
  context: string;
  useSearch: boolean;
  onBack: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ context, useSearch, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<ProxyChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat on mount
    chatRef.current = createDiscoveryChat(context, useSearch);
    
    // Initial greeting from the system (simulated)
    const initialGreeting: ChatMessage = {
      id: 'init-1',
      role: 'model',
      text: `I am the Sovereign Architect. I have analyzed your target context: "${context.slice(0, 50)}${context.length > 50 ? '...' : ''}".\n\nHow shall we shape this entity? We should discuss its Prime Directive and necessary Immunological Constraints.`,
      timestamp: Date.now()
    };
    setMessages([initialGreeting]);
  }, [context, useSearch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: userMsg.text });
      
      const botMsgId = (Date.now() + 1).toString();
      
      // Initialize bot message placeholder
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      let fullText = '';
      
      for await (const chunk of result) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: fullText } : msg
          ));
        }
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: '[SYSTEM ERROR]: Epistemic breach detected. Connection to Architect lost.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-void-light border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-black/40">
        <div className="flex items-center space-x-3">
           <div className="p-1.5 bg-sovereign/10 rounded">
             <Bot className="w-5 h-5 text-sovereign" />
           </div>
           <div>
             <h3 className="text-sm font-bold text-white">Architectural Discourse</h3>
             <p className="text-xs text-zinc-500 font-mono">SECURE CHANNEL</p>
           </div>
        </div>
        <button 
          onClick={onBack}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`shrink-0 w-8 h-8 rounded flex items-center justify-center ${
              msg.role === 'model' ? 'bg-zinc-800 text-sovereign' : 'bg-zinc-100 text-black'
            }`}>
              {msg.role === 'model' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
              msg.role === 'model' 
                ? 'bg-zinc-900/50 text-zinc-300 border border-zinc-800' 
                : 'bg-zinc-100 text-black'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 text-zinc-600 pl-12">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs font-mono">ARCHITECT IS THINKING...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/20 border-t border-zinc-800">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Discuss constraints, abilities, or identity..."
            className="w-full bg-void border border-zinc-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:border-sovereign focus:ring-1 focus:ring-sovereign outline-none transition-all placeholder:text-zinc-600"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-sovereign disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
