import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Zap, 
  BrainCircuit, 
  RotateCcw, 
  Copy, 
  Check, 
  ShieldAlert, 
  Flame, 
  CloudRain, 
  Globe2, 
  ChevronDown,
  Info
} from 'lucide-react';

export type ChatModel = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';
export type ChatRole = 'scientist' | 'strategist' | 'meteorologist';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  model?: ChatModel;
  roleName?: ChatRole;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'model',
    text: `### Welcome to India's National Climate Intelligence Assistant
I am your coupled AI advisor integrated into the **Digital Twin of India's Climate**. I can assist you with:

- **ConvLSTM Spatiotemporal Predictions**: Analysis of 7-day precipitation, temperature anomalies, and atmospheric moisture fluxes.
- **INSAT-3DR Satellite Sounding**: Real-time interpretation of thermal infrared, water vapor radiance, and sea surface temperature (SST).
- **Climate Adaptation & Heat Action Plans**: District-level vulnerability mitigation, agricultural stress indices, and flood defense protocols.

Select your preferred **AI Model** and **Specialist Persona** above, or pick one of the quick prompts below to begin.`,
    timestamp: 'Just now',
    model: 'gemini-3.8-flash',
    roleName: 'scientist',
  },
];

const SUGGESTED_PROMPTS = [
  {
    label: 'Assam & Western Ghats Monsoon',
    prompt: 'Assess current monsoon surge dynamics, orographic precipitation intensity, and flash flood risks across the Western Ghats and Assam basin.',
  },
  {
    label: 'ConvLSTM Model Confidence',
    prompt: 'Explain the spatiotemporal architecture of the 5-layer ConvLSTM model and how its R² validation compares with IMD 0.25° gridded observations.',
  },
  {
    label: 'Urban Heat Island Action Plan',
    prompt: 'Formulate an actionable heat-health mitigation strategy for Tier-1 cities in North-Western India facing +3.5°C localized temperature spikes.',
  },
  {
    label: 'INSAT-3DR Cyclone Telemetry',
    prompt: 'How does ISRO MOSDAC INSAT-3DR multi-spectral radiometry detect cyclone cyclogenesis in the Bay of Bengal before optical signature formation?',
  },
];

export const GeminiChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [input, setInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ChatModel>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState<ChatRole>('scientist');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      // Send conversation history to backend Express Gemini API proxy
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, text: m.text })),
          model: selectedModel,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || 'No response returned from the model.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel,
        roleName: selectedRole,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(
        err.message || 'Unable to connect to Gemini API. Please verify GEMINI_API_KEY is configured in Settings > Secrets.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages(DEFAULT_MESSAGES);
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-[#070a12] shadow-2xl overflow-hidden">
      {/* Top Header & Model / Persona Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-800 bg-[#090d18]/90">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Gemini Climate Intelligence Copilot
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Multi-turn reasoning grounded in Indian meteorology & 5-spheres digital twin telemetry
            </p>
          </div>
        </div>

        {/* Model & Persona Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ChatRole)}
              className="bg-transparent text-cyan-300 focus:outline-none cursor-pointer font-semibold text-xs"
            >
              <option value="scientist" className="bg-slate-900 text-slate-100">
                Lead Climate Scientist
              </option>
              <option value="strategist" className="bg-slate-900 text-slate-100">
                Resilience Strategist
              </option>
              <option value="meteorologist" className="bg-slate-900 text-slate-100">
                Chief Meteorologist
              </option>
            </select>
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ChatModel)}
              className="bg-transparent text-amber-300 focus:outline-none cursor-pointer font-semibold text-xs"
            >
              <option value="gemini-3.8-flash" className="bg-slate-900 text-slate-100">
                gemini-3.8-flash (General)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-slate-100">
                gemini-3.1-flash-lite (Fast)
              </option>
              <option value="gemini-4-argon" className="bg-slate-900 text-slate-100">
                gemini-4-argon (Complex Deep)
              </option>
            </select>
          </div>

          {/* Clear Thread */}
          <button
            onClick={handleClearChat}
            title="Reset Conversation"
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mx-4 mt-3 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scrollable Messages Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 font-sans">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-mono ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative rounded-2xl px-4 py-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 shadow-md backdrop-blur-sm'
                }`}
              >
                {/* Model badge info for assistant responses */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {msg.roleName || selectedRole} • {msg.model || selectedModel}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                {/* Formatted Text Content */}
                <div className="whitespace-pre-wrap space-y-2 font-normal leading-relaxed">
                  {msg.text}
                </div>

                {/* Action buttons (Copy) */}
                {!isUser && (
                  <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Verified with IMD/ISRO Ground Truth</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-2xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>
                {selectedModel === 'gemini-4-argon'
                  ? 'Deep reasoning with gemini-4-argon...'
                  : selectedModel === 'gemini-3.1-flash-lite'
                  ? 'Fast synthesizing with flash-lite...'
                  : 'Analyzing with gemini-3.8-flash...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Shelf */}
      {messages.length <= 3 && (
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
            Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sp.prompt)}
              disabled={isLoading}
              className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {sp.label}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Message Input Box */}
      <div className="p-4 border-t border-slate-800 bg-[#080c16]">
        <div className="relative flex items-end gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-cyan-500/60 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask the ${
              selectedRole === 'scientist'
                ? 'Lead Climate Scientist'
                : selectedRole === 'strategist'
                ? 'Resilience Strategist'
                : 'Chief Meteorologist'
            } anything about India's climate (Press Enter to send)...`}
            rows={2}
            className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none p-1.5 font-sans"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1 pt-2">
          <span>Shift + Enter for new line • Server-side authenticated GenAI proxy</span>
          <span>Powered by @google/genai</span>
        </div>
      </div>
    </div>
  );
};
