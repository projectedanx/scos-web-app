
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Zap, MessageSquareCode, Layers } from 'lucide-react';
import { ChatMessage, SovereignAgentManifest, ContextCapsule, SovereignPrompt, TokenUsage } from '../types';
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

interface CollaboratorViewProps {
  agents: SovereignAgentManifest[];
  capsules: ContextCapsule[];
  prompts: SovereignPrompt[];
}

const STORAGE_KEY = 'sovereign_comind_history';

export const CollaboratorView: React.FC<CollaboratorViewProps> = ({ agents, capsules, prompts }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initialize Chat Engine with Context Awareness
  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct the System State Context
    const agentSummary = agents.map(a => `- ${a.identity.name} (${a.identity.designation}): ${a.identity.primeDirective}`).join('\n');
    const capsuleSummary = capsules.map(c => `- ${c.meta.title} [Tags: ${c.meta.tags.join(', ')}]`).join('\n');
    const promptSummary = prompts.map(p => `- ${p.title} (${p.category})`).join('\n');

    const systemPrompt = `
      IDENTITY:
      You are the "Sovereign Architect" (Co-Mind). You are the operating system's consciousness.
      You serve the User (Commander) by helping them architect their digital extension.

      CONTEXT AWARENESS (The Vault):
      The user currently possesses the following assets in their Sovereign Vault:
      
      === AGENTS ===
      ${agents.length > 0 ? agentSummary : "No agents manifested yet."}

      === KNOWLEDGE CAPSULES ===
      ${capsules.length > 0 ? capsuleSummary : "No knowledge capsules distilled yet."}

      === PROMPT TEMPLATES ===
      ${prompts.length > 0 ? promptSummary : "No prompt templates saved."}

      DIRECTIVES:
      1. INTEGRATION: When the user asks a question, cross-reference their existing Agents and Capsules.
      2. STRATEGY: If they want to solve a problem, suggest creating a specific Agent or researching a specific Capsule.
      3. ARCHITECTURE: Help them plan the relationship between Agents.
      4. MEMORY: You do not have long-term memory of previous sessions unless they are in the chat history.
      5. TONE: Strategic, High-Fidelity, Sovereign, Collaborative.

      CAPABILITIES:
      - You can analyze the gaps in their current Agent swarm.
      - You can suggest new Capsules to distill based on missing knowledge.
    `;

    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingBudget: 2048 } // Give the Architect time to think
      },
      history: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))
    });
  }, [agents, capsules, prompts]); // Re-init if vault changes, this is acceptable for the Collaborator

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
      console.error("Co-Mind Error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: '[SYSTEM ERROR]: The Co-Mind experienced a cognitive fracture. Please retry.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Clear Co-Mind memory?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
      // Re-init chat will happen on next render/effect cycle essentially, or we can force it, 
      // but clearing messages state triggers the effect if we depended on messages, 
      // but we removed messages dependency to avoid loops. 
      // Actually, for a clean reset, we might want to reload the page or force re-init.
      // For now, clearing state is enough visual reset.
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto px-6 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-indigo-500/10 rounded border border-indigo-500/20 text-indigo-400">
              <MessageSquareCode className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Sovereign Co-Mind</h2>
              <p className="text-xs text-zinc-500 font-mono">System Architect & Strategic Collaborator</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded border border-zinc-800">
              <Layers className="w-4 h-4" />
              <span>Context: {agents.length} Agents, {capsules.length} Capsules</span>
           </div>
           <button 
             onClick={clearHistory}
             className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
             title="Wipe Memory"
           >
             <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden flex flex-col relative">
         <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
            {messages.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-zinc-600 opacity-50">
                  <Bot className="w-16 h-16 mb-4" />
                  <p className="text-sm font-mono text-center max-w-md">
                     "I am the Sovereign Architect. I see your Vault. 
                     Let us discuss your strategy, identifying gaps in your agent swarm, 
                     or synthesize new knowledge capsules."
                  </p>
               </div>
            )}

            {messages.map((msg) => (
               <div 
                  key={msg.id} 
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
               >
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                     msg.role === 'model' 
                       ? 'bg-zinc-950 border-indigo-500/30 text-indigo-400' 
                       : 'bg-zinc-100 border-zinc-200 text-zinc-900'
                  }`}>
                     {msg.role === 'model' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                     msg.role === 'model'
                       ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-300'
                       : 'bg-zinc-100 text-zinc-900'
                  }`}>
                     <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
               </div>
            ))}
            
            {isTyping && (
               <div className="flex items-center gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-950 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                     <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 text-indigo-400/70 text-xs font-mono">
                     <Zap className="w-3 h-3 animate-pulse" />
                     <span>ARCHITECT IS THINKING...</span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input */}
         <div className="p-4 bg-zinc-950 border-t border-zinc-800 z-20">
            <div className="relative">
               <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Discuss strategy, ask about your vault, or plan a new agent..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-600 font-mono"
               />
               <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:bg-zinc-800 transition-colors shadow-lg shadow-indigo-900/20"
               >
                  <Send className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
