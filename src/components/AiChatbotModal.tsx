import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Languages, 
  Sprout, 
  User,
  Wheat
} from 'lucide-react';

interface AiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiChatbotModal: React.FC<AiChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am your MandiMart AI Agricultural Assistant. Ask me anything regarding wholesale mandi prices, crop grading standards, competitive auction bidding, or computer vision quality scoring.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { en: "Today's Tomato price in Azadpur Mandi?", hi: "आज़ादपुर मंडी में आज टमाटर का क्या भाव है?" },
    { en: "How do I list my crop lot on MandiMart?", hi: "मंडीमार्ट पर अपनी फसल कैसे लिस्ट करें?" },
    { en: "Explain live auction and bidding rules", hi: "लाइव नीलामी और बोली लगाने के क्या नियम हैं?" },
    { en: "How does the AI vegetable quality score work?", hi: "सब्जी गुणवत्ता स्कोर कैसे काम करता है?" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language }),
      });

      const data = await res.json();
      setLoading(false);

      const botReply = data.reply || (language === 'hi'
        ? 'क्षमा करें, इस समय जानकारी प्राप्त नहीं हो सकी। कृपया दोबारा प्रयास करें।'
        : 'Sorry, I could not process your query right now. Please try again.');

      const assistantMsg: Message = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: 'Connection error while communicating with agricultural intelligence service.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full h-[620px] max-h-[92vh] border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#143D28] text-white p-4 flex items-center justify-between border-b border-[#1E5638]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center shadow">
              <Bot className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-serif flex items-center gap-1.5">
                MandiMart AI Assistant
                <span className="text-[10px] bg-emerald-800 text-emerald-200 font-sans px-1.5 py-0.2 rounded font-semibold uppercase">
                  Agri-LLM
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                Live Mandi Prices, Grading & Trade Advisory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-emerald-900/80 p-0.5 rounded border border-emerald-700 text-[11px] font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded transition-colors ${language === 'en' ? 'bg-amber-400 text-amber-950' : 'text-emerald-200 hover:text-white'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded transition-colors ${language === 'hi' ? 'bg-amber-400 text-amber-950' : 'text-emerald-200 hover:text-white'}`}
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-emerald-300 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-slate-200 text-slate-700' : 'bg-[#1B4332] text-white'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Wheat className="w-4 h-4" />}
                </div>

                <div className={`max-w-[82%] rounded-xl p-3 text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-emerald-800 text-white shadow-xs rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-none whitespace-pre-line'
                }`}>
                  <div>{m.text}</div>
                  <div className={`text-[10px] mt-1 text-right ${isUser ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>Analyzing market knowledge base...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px]">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(language === 'hi' ? q.hi : q.en)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 shrink-0 transition-colors font-medium"
            >
              {language === 'hi' ? q.hi : q.en}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder={language === 'hi' ? "कृषि सम्बन्धी कोई भी प्रश्न यहाँ लिखें..." : "Ask about mandi prices, auction lots, or crop grading..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs sm:text-sm rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
