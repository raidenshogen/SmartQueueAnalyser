import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Send } from 'lucide-react';
import { useI18n } from '../lib/i18n/i18n';
import { formatMessageText } from '../lib/helpers';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  chatMessages: Array<{ role: 'user' | 'model', text: string }>;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendChat: () => void;
  chatLoading: boolean;
}

export default function AIAssistantModal({ isOpen, onClose, darkMode, chatMessages, chatInput, setChatInput, handleSendChat, chatLoading }: AIAssistantModalProps) {
  const { t } = useI18n();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dm = (light: string, dark: string) => darkMode ? dark : light;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#202020]/40 backdrop-blur-sm flex items-center justify-end z-50 p-4">
          <motion.div key="assistant" initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 200, opacity: 0 }}
            className={`w-full max-w-md h-full rounded-2xl flex flex-col shadow-xl overflow-hidden border-l ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>

            <div className={`p-5 border-b flex justify-between items-center ${dm('border-[#e8e8e8] bg-[#fbfbfb]', 'border-[#2a2a2a] bg-[#161616]')}`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ff682c]" />
                <div>
                  <h3 className={`font-display font-semibold text-sm ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{t('overview.aiChat')}</h3>
                  <p className="text-[11px] text-slate-400">{t('overview.aiAdvisorSubtitle')}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer">{t('common.cancel')}</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                    msg.role === 'user' ? 'bg-[#202020] text-white rounded-tr-none' 
                    : dm('bg-slate-50 border border-slate-200 text-[#202020]', 'bg-[#222] border border-[#333] text-[#e5e5e5]') + ' rounded-tl-none'
                  }`}>
                    {formatMessageText(msg.text, darkMode)}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 items-center text-[11px] text-slate-400 font-medium">
                  <RefreshCw className="w-3 h-3 text-[#ff682c] animate-spin" /> {t('common.loading')}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 border-t flex gap-2 ${dm('border-[#e8e8e8] bg-white', 'border-[#2a2a2a] bg-[#161616]')}`}>
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder={t('overview.aiChat')}
                className={`flex-1 border focus:outline-none focus:border-[#ff682c] rounded-lg px-3.5 py-2.5 text-xs ${dm('bg-slate-50 border-slate-200 text-[#202020]', 'bg-[#222] border-[#333] text-[#e5e5e5]')}`} />
                <button onClick={() => handleSendChat()} className="px-4 py-2.5 bg-[#202020] hover:bg-slate-800 text-white rounded-lg transition active:scale-95 cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}