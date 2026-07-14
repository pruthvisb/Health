'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, User, HelpCircle, Flame } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const PRESET_QUESTIONS = [
  "Why is my weight increasing?",
  "Suggest healthier meal swaps",
  "Explain BMR vs TDEE formulas",
  "Give me daily motivation!",
  "What is my weight plateau?"
];

export default function AICoachView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your AI Health Coach. Ask me anything about your diet, weight plateaus, exercise suggestions, or how to hit your daily goals! 🌟"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: `coach-${Date.now()}`,
        role: 'assistant',
        content: data.reply
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Oops! I encountered a slight connection issue. However, remember to stay hydrated and hit your macro targets today!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col h-[520px] justify-between relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
            <Bot size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1">
              AI Coach
              <span className="text-xxs font-normal bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Online</span>
            </h4>
            <p className="text-xxs text-gray-400">Powered by Gemini 1.5 Flash</p>
          </div>
        </div>
        <HelpCircle size={16} className="text-gray-500" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4 scrollbar-thin">
        {messages.map(m => (
          <div 
            key={m.id}
            className={`flex items-start gap-3 max-w-[85%] ${
              m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
              m.role === 'user' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            
            <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
              m.role === 'user'
                ? 'bg-indigo-500/15 text-indigo-100 rounded-tr-none border border-indigo-500/20'
                : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3 max-w-[80%]">
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-white/5 text-gray-400 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Footer (Preset options & Input bar) */}
      <div className="space-y-3">
        {/* Preset chips */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xxs px-2.5 py-1 bg-white/5 border border-white/5 hover:border-emerald-500/20 rounded-full text-gray-400 hover:text-white transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input form */}
        <form 
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask about weight, BMR, recipes..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500/50"
          />
          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
}
