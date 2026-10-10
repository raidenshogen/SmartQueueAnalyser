import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { User, ShieldAlert, Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import { useI18n } from '../lib/i18n/i18n';

interface SettingsPageProps {
  darkMode: boolean;
  auth: any;
  n8nWebhookUrl: string;
  setN8nWebhookUrl: React.Dispatch<React.SetStateAction<string>>;
  handleTestWebhook: () => void;
  webhookTestStatus: 'idle' | 'testing' | 'success' | 'failed';
  webhookTestResponse: string;
  lang: 'fr' | 'en' | 'ar';
  setLang: (lang: 'fr' | 'en' | 'ar') => void;
}

export default function SettingsPage({ darkMode, auth, n8nWebhookUrl, setN8nWebhookUrl, handleTestWebhook, webhookTestStatus, webhookTestResponse, lang, setLang }: SettingsPageProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dm = (light: string, dark: string) => darkMode ? dark : light;

  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">

      {/* Profile */}
      <div className={`p-8 rounded-lg border space-y-6 ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-[#ff682c]" />
          <h3 className={`font-display font-semibold text-sm uppercase tracking-wider ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{t('profile.title')}</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img src={auth.selectedIndividual.avatarUrl} alt={auth.selectedIndividual.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={auth.avatarUploading}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait">
              {auth.avatarUploading ? <RefreshCw className="w-6 h-6 text-white animate-spin" /> : (
                <div className="text-center">
                  <svg className="w-6 h-6 text-white mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] font-bold text-white uppercase">Change</span>
                </div>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={auth.handleAvatarUpload} className="hidden" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className={`text-base font-bold ${dm('text-slate-800', 'text-[#e5e5e5]')}`}>{auth.selectedIndividual.name}</p>
            <p className="text-sm text-slate-400 capitalize mb-2">{auth.selectedIndividual.role}</p>
            <p className="text-xs text-slate-500">{t('settings.avatarHint1')}</p>
            <p className="text-[10px] text-slate-400 mt-1">{t('settings.avatarHint2')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t('profile.name')}</label>
            <input type="text" value={auth.selectedIndividual.name} onChange={(e) => auth.setSelectedIndividual({...auth.selectedIndividual, name: e.target.value})}
              className={`w-full border rounded-lg px-4 py-2.5 text-xs ${dm('bg-white border-slate-200 text-slate-700', 'bg-[#222] border-[#333] text-slate-300')}`} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t('profile.email')}</label>
            <input type="email" value={auth.selectedIndividual.email} readOnly
              className={`w-full border rounded-lg px-4 py-2.5 text-xs cursor-not-allowed ${dm('bg-slate-50 border-slate-200 text-slate-500', 'bg-[#222] border-[#333] text-slate-400')}`} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={auth.handleSaveProfile} className="px-4 py-2 bg-[#202020] hover:bg-slate-800 text-white font-bold text-xs rounded transition flex items-center gap-1 cursor-pointer">{t('common.save')}</button>
        </div>
      </div>

      {/* Biometric */}
      <div className={`p-8 rounded-lg border space-y-4 ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-[#ff682c]" />
          <h3 className={`font-display font-semibold text-sm uppercase tracking-wider ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{t('settings.accountProtection')}</h3>
        </div>
        <div className={`flex items-center justify-between p-4 border rounded-lg ${dm('border-slate-200 bg-slate-50', 'border-[#2a2a2a] bg-[#222]')}`}>
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${dm('text-slate-700', 'text-slate-300')}`}>{t('profile.enableBiometrics')}</span>
              {auth.biometricSupported ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider">{t('settings.available')}</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 text-[9px] font-bold uppercase tracking-wider">{t('settings.notAvailable')}</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{auth.biometricSupported ? t('profile.setupBiometrics') : t('profile.enableBiometrics')}</p>
          </div>
          <button onClick={auth.handleBiometricToggle} disabled={auth.biometricBusy || !auth.biometricSupported}
            className={`relative w-12 h-6 rounded-full transition shrink-0 ${auth.selectedIndividual.biometricActive ? 'bg-[#ff682c]' : 'bg-slate-300'} ${auth.biometricBusy ? 'opacity-50 cursor-wait' : ''} ${!auth.biometricSupported ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform flex items-center justify-center ${auth.selectedIndividual.biometricActive ? 'translate-x-6' : ''}`}>
              {auth.biometricBusy && <RefreshCw className="w-3 h-3 text-[#ff682c] animate-spin" />}
            </span>
          </button>
        </div>
      </div>

      {/* Webhook */}
      <div className={`p-8 rounded-lg border space-y-4 ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon className="w-4 h-4 text-[#ff682c]" />
          <h3 className={`font-display font-semibold text-sm uppercase tracking-wider ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{t('settings.title')}</h3>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t('settings.n8nWebhook')}</label>
          <input type="text" value={n8nWebhookUrl} onChange={(e) => setN8nWebhookUrl(e.target.value)}
            className={`w-full border rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-[#ff682c] ${dm('bg-[#fbfbfb] border-slate-200', 'bg-[#222] border-[#333] text-slate-300')}`} />
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={handleTestWebhook} disabled={webhookTestStatus === 'testing' || !n8nWebhookUrl}
            className="px-4 py-2 text-xs font-bold rounded-lg transition bg-[#ff682c] hover:bg-[#202020] text-white disabled:opacity-50">
            {webhookTestStatus === 'testing' ? t('common.loading') : t('settings.testWebhook')}
          </button>
          {webhookTestStatus !== 'idle' && (
            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border ${webhookTestStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-500 border-rose-200'}`}>
              {webhookTestStatus === 'success' ? t('settings.success') : t('settings.failed')}
            </span>
          )}
        </div>
        {webhookTestResponse && (
          <pre className="text-[10px] font-mono p-3 bg-slate-900 text-emerald-400 overflow-x-auto rounded max-h-48 whitespace-pre-wrap">{webhookTestResponse}</pre>
        )}
      </div>

      {/* Language */}
      <div className={`p-8 rounded-lg border space-y-4 ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-4 h-4 text-[#ff682c] font-bold text-sm">🌐</span>
          <h3 className={`font-display font-semibold text-sm uppercase tracking-wider ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{t('settings.language')}</h3>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t('settings.language')}</label>
          <div className="flex gap-2">
            {(['fr', 'en', 'ar'] as const).map((lng) => {
              const labels: Record<string, Record<string, string>> = {
                fr: { fr: 'Français', en: 'Anglais', ar: 'Arabe' },
                en: { fr: 'French', en: 'English', ar: 'Arabic' },
                ar: { fr: 'الفرنسية', en: 'الإنجليزية', ar: 'العربية' },
              };
              const label = labels[lang]?.[lng] || lng.toUpperCase();
              return (
                <button key={lng} type="button" onClick={() => setLang(lng)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition border ${
                    lang === lng ? 'bg-[#ff682c] text-white border-[#ff682c]' : dm('bg-white text-slate-600 border-slate-200 hover:bg-slate-50', 'bg-[#222] text-slate-400 border-[#333] hover:bg-[#2a2a2a]')
                  }`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}