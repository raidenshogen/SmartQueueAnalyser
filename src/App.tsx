import React, { useState, useEffect } from 'react';
import { useI18n } from './lib/i18n/i18n';
import { Activity, AlertTriangle, Gauge, History as HistoryIcon, Settings as SettingsIcon, Sparkles, CheckCircle, TrendingUp, RefreshCw, LogOut, FileText, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useDashboardData } from './hooks/useDashboardData';

// Components
import Dropdown from './components/ui/Dropdown';
import AIAssistantModal from './pages/AIAssistantModal';
import { cleanSiteNameFrontend, cleanServiceNameFrontend } from './lib/helpers';

// Pages
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import HistoryPage from './pages/HistoryPage';
import PredictionsPage from './pages/PredictionsPage';
import SettingsPage from './pages/SettingsPage';

// Types
import { TabType } from './types';

export default function App() {
  const { t, lang, setLang, dir } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('darkMode') === 'true');
  const [appToast, setAppToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model', text: string }>>([
    { role: 'model', text: `### Welcome back, Director.\nI am connected directly to the SmartQueueAnalyser forecasting logs.\n*Ask me anything about:*\n- **SLA Violation Alerts**\n- **Resource Placement**\n- **Queue Performance**` }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('https://ebook-untagged-smelting.ngrok-free.dev/webhook/api/data');
  const [webhookTestStatus, setWebhookTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [webhookTestResponse, setWebhookTestResponse] = useState<string>('');
  const [comparisonHorizon, setComparisonHorizon] = useState<'week' | 'month' | 'quarter'>('month');
  const [timePeriod, setTimePeriod] = useState(t('history.week'));

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAppToast({ message, type });
    setTimeout(() => setAppToast(null), 4500);
  };

  const dm = (light: string, dark: string) => darkMode ? dark : light;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const onGoogleFail = () => {
    setChatMessages(prev => [...prev, { role: 'model', text: `Connection timeout: fall-back validation completed successfully.` }]);
    showToast('Chat connection lost. Showing fallback response.', 'error');
  };

  // Initialize Hooks
  const auth = useAuth(showToast, onGoogleFail);
  const dashboard = useDashboardData(auth.authMode, n8nWebhookUrl, comparisonHorizon, showToast);

  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;
    if (!presetText) setChatInput('');
    
    setChatMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setChatLoading(true);
    
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', payload: { message: textToSend, question: textToSend, history: chatMessages } })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const replyText = data.answer || data.reply || data.text || data.message || (data.data && (data.data.answer || data.data.reply)) || "No response received.";
      setChatMessages(prev => [...prev, { role: 'model', text: replyText }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: `⚠️ Connection failed.` }]);
    } finally { setChatLoading(false); }
  };

  const handleTestWebhook = async () => {
    setWebhookTestStatus('testing');
    setWebhookTestResponse('');
    try {
      const response = await fetch('/api/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test', n8nWebhookUrl, payload: { timestamp: new Date().toISOString(), message: "Hello!" } })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setWebhookTestStatus('success');
        setWebhookTestResponse(JSON.stringify(data.data || data, null, 2));
        showToast(t('common.save'), 'success');
      } else {
        setWebhookTestStatus('failed');
        setWebhookTestResponse(data.error || "Failed");
        showToast(t('common.noData'), 'error');
      }
    } catch (e: any) {
      setWebhookTestStatus('failed');
      setWebhookTestResponse(e.message);
      showToast('Webhook error: ' + e.message, 'error');
    }
  };

  return (
    <div className={`absolute inset-0 font-sans overflow-x-hidden select-none transition-colors duration-200 ${dm('bg-[#efefef] text-[#202020]', 'bg-[#0f0f0f] text-[#e5e5e5]')}`} dir={dir}>
      <AnimatePresence mode="wait">
        {auth.authMode !== 'authenticated' ? (
          <LoginPage auth={auth} lang={lang} setLang={setLang} t={t} darkMode={darkMode} dm={dm} />
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`min-h-screen flex w-full ${dm('bg-[#efefef]', 'bg-[#0f0f0f]')}`}>
            
            {/* Toast */}
            {appToast && (
              <div className={`fixed top-5 right-5 z-[10000] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-xs font-semibold transition-all duration-300 max-w-md ${appToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : appToast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                {appToast.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : appToast.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> : <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />}
                <span>{appToast.message}</span>
              </div>
            )}

            {/* SIDEBAR */}
            <aside className={`w-64 flex flex-col justify-between p-6 shrink-0 border-r ${dm('bg-[#efefef] border-[#e8e8e8]', 'bg-[#161616] border-[#2a2a2a]')}`}>
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#ff682c] flex items-center justify-center text-white">
                    <span className="font-display font-bold text-sm">S</span>
                  </div>
                  <span className={`font-display font-bold text-sm tracking-tight ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>SmartQueueAnalyser</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Operations</span>
                    <nav className="space-y-1">
                      <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${activeTab === 'overview' ? 'bg-[#ffedeb]/80 text-[#ff682c] font-semibold' : dm('text-slate-600 hover:bg-[#e8e8e8]', 'text-slate-400 hover:bg-[#2a2a2a]')}`}>
                        <Gauge className="w-4 h-4" /><span>{t('nav.overview')}</span>
                      </button>
                      <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${activeTab === 'history' ? 'bg-[#ffedeb]/80 text-[#ff682c] font-semibold' : dm('text-slate-600 hover:bg-[#e8e8e8]', 'text-slate-400 hover:bg-[#2a2a2a]')}`}>
                        <HistoryIcon className="w-4 h-4" /><span>{t('nav.history')}</span>
                      </button>
                      <button onClick={() => setActiveTab('predictions')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${activeTab === 'predictions' ? 'bg-[#ffedeb]/80 text-[#ff682c] font-semibold' : dm('text-slate-600 hover:bg-[#e8e8e8]', 'text-slate-400 hover:bg-[#2a2a2a]')}`}>
                        <TrendingUp className="w-4 h-4" /><span>{t('nav.predictions')}</span>
                      </button>
                    </nav>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">System</span>
                    <nav className="space-y-1">
                      <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${activeTab === 'settings' ? 'bg-[#ffedeb]/80 text-[#ff682c] font-semibold' : dm('text-slate-600 hover:bg-[#e8e8e8]', 'text-slate-400 hover:bg-[#2a2a2a]')}`}>
                        <SettingsIcon className="w-4 h-4" /><span>{t('nav.settings')}</span>
                      </button>
                      <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs bg-transparent ${dm('text-slate-600', 'text-slate-400')}`}>
                        <span className="font-medium">{t('settings.theme')}</span>
                        <button onClick={() => setDarkMode(!darkMode)} className={`w-8 h-4 rounded-full relative transition-colors focus:outline-none ${darkMode ? 'bg-[#ff682c]' : 'bg-slate-300'}`}>
                          <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-4' : ''}`} />
                        </button>
                      </div>
                    </nav>
                  </div>
                </div>
              </div>
              <div className={`border-t pt-4 space-y-3 ${dm('border-[#e8e8e8]', 'border-[#2a2a2a]')}`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={auth.selectedIndividual.avatarUrl} alt={auth.selectedIndividual.name} className={`w-10 h-10 rounded-full object-cover border ${dm('border-[#e8e8e8]', 'border-[#333]')}`} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-bold truncate leading-tight ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{auth.selectedIndividual.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize truncate">{auth.selectedIndividual.role}</p>
                  </div>
                </div>
                <button onClick={auth.handleLogout} className="w-full flex items-center gap-2 px-1.5 py-1 text-slate-400 hover:text-[#ff682c] text-[11px] font-medium transition cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" /><span>{t('nav.logout')}</span>
                </button>
              </div>
            </aside>

            {/* MAIN PANEL */}
            <main className={`flex-1 flex flex-col min-w-0 ${dm('bg-[#efefef]', 'bg-[#0f0f0f]')}`}>
              <header className={`px-8 py-5 flex items-center justify-between ${dm('bg-[#efefef]', 'bg-[#0f0f0f]')}`}>
                <h1 className={`font-display font-semibold text-2xl tracking-tight ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>
                  {activeTab === 'overview' && t('overview.title')}
                  {activeTab === 'history' && t('history.title')}
                  {activeTab === 'predictions' && t('predictions.title')}
                  {activeTab === 'settings' && t('settings.title')}
                </h1>
                <div className="flex items-center gap-2.5">
                                      {activeTab === 'overview' && (
                    <Dropdown 
                      value={timePeriod} 
                      onChange={(v) => setTimePeriod(v)} 
                      width="w-40" 
                      options={[
                        { value: t('history.week'), label: t('history.week') }, 
                        
                      ]} 
                    />
                  )}
                    {activeTab === 'history' && (
                    <>
                      <Dropdown 
                        value={dashboard.historyPeriod} 
                        onChange={(v) => { dashboard.setHistoryPeriod(v); dashboard.setHistoryPage(1); }} 
                        width="w-40" 
                        options={[
                          { value: "Last Week", label: t('history.week') }, 
                          { value: "Last Month", label: t('history.month') }, 
                          { value: "Last Quarter", label: t('history.quarter') }
                        ]} 
                      />
                      <Dropdown 
                        value={dashboard.historySite} 
                        onChange={(v) => { dashboard.setHistorySite(v); dashboard.setHistoryPage(1); }} 
                        width="w-48" 
                        options={dashboard.historySitesOpts} 
                      />
                      <Dropdown 
                        value={dashboard.historyService} 
                        onChange={(v) => { dashboard.setHistoryService(v); dashboard.setHistoryPage(1); }} 
                        width="w-48" 
                        options={dashboard.historyServicesOpts} 
                      />
                      <button onClick={dashboard.exportHistoryToXLSX} className="px-4 py-2 bg-[#202020] hover:bg-slate-800 text-white font-medium text-xs rounded-full transition flex items-center gap-1.5 cursor-pointer">
                        <FileText className="w-3.5 h-3.5" /><span>{t('common.save')}</span>
                      </button>
                    </>
                  )}
                  {activeTab === 'predictions' && (
                    <>
                      <Dropdown 
                        value={dashboard.predictionTimePeriod} 
                        onChange={(v) => { 
                          dashboard.setPredictionTimePeriod(v); 
                          setComparisonHorizon(v === 'Next Week' ? 'week' : v === 'Next Quarter' ? 'quarter' : 'month'); 
                          dashboard.setHistoryPage(1); 
                        }} 
                        width="w-40" 
                        options={[
                          { value: "Next Week", label: t('predictions.week') }, 
                          { value: "Next Month", label: t('predictions.month') }, 
                          { value: "Next Quarter", label: t('predictions.quarter') }
                        ]} 
                      />
                      <Dropdown 
                        value={dashboard.predictionSite} 
                        onChange={(v) => { dashboard.setPredictionSite(v); dashboard.setHistoryPage(1); }} 
                        width="w-48" 
                        options={dashboard.historySitesOpts} 
                      />
                      <Dropdown 
                        value={dashboard.predictionService} 
                        onChange={(v) => { dashboard.setPredictionService(v); dashboard.setHistoryPage(1); }} 
                        width="w-48" 
                        options={dashboard.historyServicesOpts} 
                      />
                    </>
                  )}
                  <button onClick={() => setShowAssistantModal(true)} className="px-4 py-2 bg-[#ff682c]/10 text-[#ff682c] border border-[#ff682c]/20 hover:bg-[#ff682c]/20 font-medium text-xs rounded-full transition flex items-center gap-1.5 cursor-pointer ml-2">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /><span>{t('overview.aiChat')}</span>
                  </button>
                </div>
              </header>

              <div className="flex-1 px-8 pb-8 overflow-y-auto space-y-6">
                <div className={`border rounded-lg px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3 mt-4 ${dm('bg-[#fff9f6] border-[#ff682c]/20 text-[#b03d0d]', 'bg-[#1a1a1a] border-[#ff682c]/30 text-[#ff9f6b]')}`}>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff682c] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff682c]"></span>
                    </span>
                    <span className="font-semibold font-display">
                     {activeTab === 'predictions' 
                     ? t('predictions.modelUpdateReminder')   // ✅ Add this key
                   : t('overview.dbSyncReminder')           // Existing key
                      }
                     </span>
                    <span>{t('common.syncing')}</span>
                  </div>
                  <button onClick={dashboard.handleSyncData} disabled={dashboard.syncing} className="px-3 py-1 bg-[#ff682c] text-white hover:bg-[#e05218] rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50">
                    <RefreshCw className={`w-3 h-3 ${dashboard.syncing ? 'animate-spin' : ''}`} />
                     <span>
                         {dashboard.syncing 
                         ? t('common.syncing') 
                         : activeTab === 'predictions' 
                           ? t('predictions.syncPredictions')  // ✅ New key for predictions
                          : t('overview.syncHistory')         // Keep existing for history/overview
                         }
                    </span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && <OverviewPage darkMode={darkMode} dashboard={dashboard} t={t} dm={dm} />}
                  {activeTab === 'history' && <HistoryPage darkMode={darkMode} dashboard={dashboard} t={t} dm={dm} />}
                  {activeTab === 'predictions' && <PredictionsPage darkMode={darkMode} dashboard={dashboard} />}
                  {activeTab === 'settings' && (
                    <SettingsPage 
                      darkMode={darkMode} auth={auth} n8nWebhookUrl={n8nWebhookUrl} setN8nWebhookUrl={setN8nWebhookUrl} 
                      handleTestWebhook={handleTestWebhook} webhookTestStatus={webhookTestStatus} webhookTestResponse={webhookTestResponse} 
                      lang={lang} setLang={setLang} 
                    />
                  )}
                </AnimatePresence>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <AIAssistantModal 
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        darkMode={darkMode}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleSendChat={handleSendChat}
        chatLoading={chatLoading}
      />
    </div>
  );
}