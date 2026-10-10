import React from 'react';
import { motion } from 'motion/react';
import { Mail, RefreshCw } from 'lucide-react';

interface LoginPageProps {
  auth: any;
  lang: 'fr' | 'en' | 'ar';
  setLang: (lang: 'fr' | 'en' | 'ar') => void;
  t: any;
  darkMode: boolean;
  dm: (light: string, dark: string) => string;
}

export default function LoginPage({ auth, lang, setLang, t, darkMode, dm }: LoginPageProps) {
  return (
    <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      <div className="lg:col-span-5 flex flex-col justify-between p-8 lg:p-14 bg-white relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ff682c] flex items-center justify-center text-white">
            <span className="font-display font-medium text-lg">S</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-[#202020]">SmartQueueAnalyser</span>
        </div>

        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {auth.authMode === 'login' && (
            <>
              <div className="pb-2">
                <h1 className="font-display text-[#202020] tracking-tight font-light leading-none text-4xl sm:text-5xl">
                  {t('auth.login.title')} <br />
                  <span className="font-semibold block mt-0.5">{t('auth.login.subtitle')}</span>
                </h1>
                <p className="text-xs text-slate-400 mt-2">{t('auth.login.description')}</p>
              </div>

              <form onSubmit={auth.handleSendCode} className="space-y-4">
                <div>
                  <input type="email" required placeholder={t('auth.login.email')} value={auth.loginEmail} onChange={(e) => auth.setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ff682c] outline-none transition" />
                </div>
                {auth.authError && <p className="text-xs text-rose-500 font-medium">{auth.authError}</p>}
                <button type="submit" disabled={auth.authLoading} className="w-full py-3 bg-[#202020] hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition cursor-pointer">
                  {auth.authLoading ? t('common.loading') : t('auth.login.signIn')}
                </button>
              </form>

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 font-medium text-xs">{t('auth.login.or')}</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
                 
                  <div id="google-signin-button" className="w-full flex justify-center"></div>
            </>
          )}

          {auth.authMode === '2fa' && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
                <Mail className="w-6 h-6 text-[#ff682c]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-medium text-[#202020]">{t('auth.twoFactor.title')}</h2>
                <p className="font-semibold text-lg text-[#ff682c]">{auth.loginEmail}</p>
              </div>

              {auth.loginEmail.includes('@gmail.com') && (
                <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-500 hover:text-[#ff682c] flex items-center gap-1 transition">
                  {t('auth.login.openGmail')} ↗
                </a>
              )}

              <form onSubmit={auth.handleVerifyCode} className="w-full space-y-4 pt-2">
                <input type="text" required placeholder={t('auth.twoFactor.code')} maxLength={6} value={auth.twoFaCode} onChange={(e) => auth.setTwoFaCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3.5 text-center tracking-[0.5em] text-lg font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff682c] outline-none transition" />
                {auth.authError && <p className="text-xs text-rose-500 font-medium">{auth.authError}</p>}
                <button type="submit" disabled={auth.authLoading || auth.twoFaCode.length < 5} className="w-full py-3.5 bg-[#202020] hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-sm rounded-xl cursor-pointer transition shadow-sm">
                  {auth.authLoading ? t('common.loading') : t('auth.twoFactor.verify')}
                </button>
              </form>

              {auth.biometricLoginAvailable && (
                <div className="w-full pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">{t('auth.login.or')}</p>
                  <button type="button" onClick={auth.handleBiometricLogin} disabled={auth.biometricAuthenticating || !auth.biometricSupported}
                    className="w-full py-3 bg-white border-2 border-[#ff682c] text-[#ff682c] hover:bg-[#ffedeb] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm rounded-full transition flex items-center justify-center gap-2">
                    {auth.biometricAuthenticating ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" />{t('common.loading')}</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-1.164 1.292A11.952 11.952 0 0112 20.535a11.952 11.952 0 01-7.83-3.672m0 0a9.953 9.953 0 012.34-1.476M12 11V7a4 4 0 00-8 0v4m0 0H4m8 0h4m0 0v4m0-4h-4" />
                        </svg>
                        {t('auth.login.useBiometrics')}
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="text-xs text-slate-500 pt-4 space-y-2 font-medium">
                <p>{t('auth.login.notSeeingEmail')} <button type="button" onClick={auth.handleSendCode} className="underline hover:text-[#ff682c] cursor-pointer">{t('auth.login.signIn')}</button></p>
                <p>{t('auth.login.wrongEmail')} <button type="button" onClick={() => { auth.setAuthMode('login'); auth.setTwoFaCode(''); }} className="underline hover:text-[#ff682c] cursor-pointer">{t('auth.login.email')}</button></p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 text-[11px] font-semibold text-slate-400 mt-4 justify-start">
          <button type="button" onClick={() => setLang('fr')} className={`hover:text-[#ff682c] ${lang === 'fr' ? 'text-[#202020]' : ''}`}>FR</button>
          <span className="text-slate-200">|</span>
          <button type="button" onClick={() => setLang('en')} className={`hover:text-[#ff682c] ${lang === 'en' ? 'text-[#202020]' : ''}`}>EN</button>
          <span className="text-slate-200">|</span>
          <button type="button" onClick={() => setLang('ar')} className={`hover:text-[#ff682c] ${lang === 'ar' ? 'text-[#202020]' : ''}`}>AR</button>
        </div>
      </div>

      <div className="hidden lg:col-span-7 bg-[#f7f3f2] flex-col items-center justify-center p-12 text-center relative border-l border-[#e8e8e8] lg:flex">
        <div className="relative w-80 h-80 flex items-center justify-center">
          <svg viewBox="0 0 400 400" className="w-76 h-76 transform hover:rotate-12 transition-transform duration-1000">
            <circle cx="200" cy="200" r="160" fill="none" stroke="#202020" strokeWidth="1" />
            <circle cx="200" cy="200" r="150" fill="none" stroke="#828282" strokeWidth="1.5" strokeDasharray="3,3" />
            <circle cx="200" cy="200" r="40" fill="none" stroke="#ff682c" strokeWidth="2" />
            <circle cx="200" cy="200" r="15" fill="#ff682c" opacity="0.1" />
            {Array.from({ length: 12 }).map((_, idx) => (
              <line key={idx} x1="200" y1="40" x2="200" y2="48" stroke="#4d4d4d" strokeWidth="1.5" transform={`rotate(${idx * 30} 200 200)`} />
            ))}
            <path d="M200,200 L185,200 L200,50 Z" fill="#ff682c" stroke="#202020" strokeWidth="1.5" />
            <path d="M200,200 L215,200 L200,50 Z" fill="#ffdbcf" stroke="#202020" strokeWidth="1.5" />
            <path d="M200,200 L185,200 L200,350 Z" fill="#ffdbcf" stroke="#202020" strokeWidth="1.5" />
            <path d="M200,200 L215,200 L200,350 Z" fill="#ff682c" stroke="#202020" strokeWidth="1.5" />
            <path d="M200,200 L200,185 L350,200 Z" fill="#ff682c" stroke="#202020" strokeWidth="1.5" />
            <path d="M200,200 L200,215 L350,200 Z" fill="#ffdbcf" stroke="#202020" strokeWidth="1.5" />
            <path d="M200,200 L200,185 L50,200 Z" fill="#ffdbcf" stroke="#202020" strokeWidth="1.5" />
            <path d="M200,200 L200,215 L50,200 Z" fill="#ff682c" stroke="#202020" strokeWidth="1.5" />
            <path d="M200,200 L190,190 L295,105 Z" fill="#816729" stroke="#202020" strokeWidth="1" />
            <path d="M200,200 L190,190 L105,295 Z" fill="#816729" stroke="#202020" strokeWidth="1" />
            <path d="M200,200 L210,190 L295,295 Z" fill="#e8e8e8" stroke="#202020" strokeWidth="1" />
            <path d="M200,200 L190,210 L105,105 Z" fill="#e8e8e8" stroke="#202020" strokeWidth="1" />
            <circle cx="200" cy="200" r="28" fill="#ffffff" stroke="#202020" strokeWidth="2.5" />
            <circle cx="200" cy="200" r="14" fill="#ff682c" stroke="#202020" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="5" fill="#ffffff" />
          </svg>
          <span className="absolute top-0 text-xl font-display font-bold text-[#202020]">N</span>
          <span className="absolute bottom-1 text-xl font-display font-bold text-[#202020]">S</span>
          <span className="absolute right-0 text-xl font-display font-bold text-[#202020]">E</span>
          <span className="absolute left-0 text-xl font-display font-bold text-[#202020]">W</span>
        </div>
        <div className="max-w-md mt-10 space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#202020]">{t('auth.login.rightPanel.title')}</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">{t('auth.login.rightPanel.description')}</p>
        </div>
        <div className="absolute bottom-8 text-[10px] font-mono tracking-widest text-slate-400">V.4.0.2 / RESOURCE ENGINE</div>
      </div>
    </motion.div>
  );
}