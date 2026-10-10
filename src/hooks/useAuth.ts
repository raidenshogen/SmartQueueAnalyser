import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../lib/i18n/i18n';
import { Individual } from '../types';

const defaultUser: Individual = {
  id: "USR-01", name: "Director", role: "Director of Analytics", email: "",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
  mfaActive: false, biometricActive: false
};

export const useAuth = (showToast: (message: string, type?: 'success' | 'error' | 'info') => void, onGoogleFail: () => void) => {
  const { t, lang } = useI18n();
  
  const [authMode, setAuthMode] = useState<'login' | 'authenticated' | '2fa'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [biometricLoginAvailable, setBiometricLoginAvailable] = useState(false);
  const [biometricAuthenticating, setBiometricAuthenticating] = useState(false);
  const [selectedIndividual, setSelectedIndividual] = useState<Individual>(defaultUser);
  const [biometricSupported, setBiometricSupported] = useState<boolean>(false);
  const [biometricBusy, setBiometricBusy] = useState<boolean>(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

    // --- GOOGLE AUTH INIT ---
  useEffect(() => {
    if (authMode !== 'login') return;

    const googleLocale = lang === 'fr' ? 'fr' : lang === 'ar' ? 'ar' : 'en';

    const initGoogleButton = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;

      g.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID_HERE",
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
        g.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          width: 300,
          text: 'signin_with',
        });
      }
    };

    // 🚀 THE SECRET SAUCE: Completely destroy the old Google SDK
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.remove();
      (window as any).google = undefined; // Wipe from memory so the new script re-initializes cleanly
    }

    // Load a fresh Google SDK script with the new language parameter in the URL
    const script = document.createElement('script');
    script.src = `https://accounts.google.com/gsi/client?hl=${googleLocale}`;
    script.async = true;
    script.defer = true;
    script.onload = initGoogleButton;
    document.body.appendChild(script);

  }, [authMode, lang]); // Re-runs immediately when you switch languages

  useEffect(() => {
    const checkBiometricSupport = async () => {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        setBiometricSupported(false);
        return;
      }
      try {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricSupported(available);
      } catch {
        setBiometricSupported(false);
      }
    };
    checkBiometricSupport();
  }, []);

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail) return setAuthError(t('auth.login.email'));
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'auth', payload: { action: 'send-code', email: loginEmail } }) });
      const data = await res.json();
      if (data.success) {
        setTwoFaCode('');
        setBiometricLoginAvailable(data.user?.biometricActive === 1);
        setAuthMode('2fa');
      } else setAuthError(data.error); 
    } catch (err) { setAuthError('Connection failed.'); } 
    finally { setAuthLoading(false); }
  };
   
  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'auth', payload: { action: 'verify-code', email: loginEmail, code: twoFaCode } }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          setSelectedIndividual({
            id: data.user.id || defaultUser.id, name: data.user.name || defaultUser.name,
            role: data.user.role || defaultUser.role, email: data.user.email,
            avatarUrl: data.user.avatarUrl || defaultUser.avatarUrl,
            mfaActive: data.user.mfaActive === 1, biometricActive: data.user.biometricActive === 1, 
          });
        }
        setAuthMode('authenticated');
      } else setAuthError(data.error || 'Invalid code');
    } catch (err) { setAuthError('Verification failed.'); } 
    finally { setAuthLoading(false); }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'auth', payload: { action: 'google', credential: response.credential } }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          setSelectedIndividual({
            id: data.user.id || defaultUser.id, name: data.user.name || defaultUser.name,
            role: data.user.role || defaultUser.role, email: data.user.email,
            avatarUrl: data.user.avatarUrl || defaultUser.avatarUrl,
            mfaActive: data.user.mfaActive === 1, biometricActive: data.user.biometricActive === 1
          });
        }
        setAuthMode('authenticated');
      } else showToast('Google login failed: ' + data.error, 'error');
    } catch (err) {
      onGoogleFail();
    }
  };

  const handleBiometricLogin = async () => {
    if (biometricAuthenticating) return;
    if (!biometricSupported) return showToast(t('profile.enableBiometrics'), 'error');
    if (!loginEmail) return showToast(t('auth.login.email'), 'info');
    setBiometricAuthenticating(true);
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const credential = await navigator.credentials.get({ publicKey: { challenge, rpId: window.location.hostname, userVerification: 'required', timeout: 60000 } }) as PublicKeyCredential | null;
      if (!credential) { setBiometricAuthenticating(false); return; }

      const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'auth', payload: { action: 'biometric-verify', email: loginEmail, credentialId: credential.id } }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          setSelectedIndividual({
            id: data.user.id || defaultUser.id, name: data.user.name || defaultUser.name,
            role: data.user.role || defaultUser.role, email: data.user.email || loginEmail,
            avatarUrl: data.user.avatarUrl || defaultUser.avatarUrl, 
            mfaActive: data.user.mfaActive === 1, biometricActive: data.user.biometricActive === 1
          });
        }
        setAuthMode('authenticated');
        showToast('Welcome back!', 'success');
      } else {
        if (data.error.includes('not found')) {
          showToast('Key mismatch. Please re-enable biometrics in Settings.', 'error');
          setAuthMode('login');
          setBiometricLoginAvailable(false);
        } else showToast('Verification failed: ' + data.error, 'error');
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') showToast('Biometric prompt timed out.', 'info');
      else showToast('Biometric login failed.', 'error');
    } finally { setBiometricAuthenticating(false); }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'auth', payload: { action: 'settings', email: selectedIndividual.email, mfaActive: selectedIndividual.mfaActive, biometricActive: selectedIndividual.biometricActive, avatarUrl: selectedIndividual.avatarUrl } }) });
      const data = await res.json();
      if (data.success) showToast(t('common.save'), 'success');
      else showToast('Save failed: ' + (data.error || 'Unknown error'), 'error');
    } catch (err: any) { showToast('Connection error: ' + err.message, 'error'); }
  };

  const enableBiometric = async () => {
    if (biometricBusy || !biometricSupported) return;
    setBiometricBusy(true);
    try {
      const challenge = new Uint8Array(32); crypto.getRandomValues(challenge);
      const userId = new TextEncoder().encode(selectedIndividual.email || 'director@smartqueue.com');
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge, rp: { name: 'SmartQueueAnalyser', id: window.location.hostname },
          user: { id: userId, name: selectedIndividual.email || 'director@smartqueue.com', displayName: selectedIndividual.name || 'Director' },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
          timeout: 60000, attestation: 'none'
        }
      }) as PublicKeyCredential | null;

      if (!credential) { showToast(t('common.cancel'), 'info'); return; }

      const attestationObject = (credential.response as AuthenticatorAttestationResponse).attestationObject;
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(attestationObject)));
      
      const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'auth', payload: { action: 'biometric-register', email: selectedIndividual.email, publicKey: publicKeyBase64, credentialId: credential.id } }) });
      const data = await res.json();
      if (data.success) {
        setSelectedIndividual({ ...selectedIndividual, biometricActive: true });
        showToast(t('profile.enableBiometrics'), 'success');
      } else showToast('Failed to save: ' + (data.error || 'Unknown'), 'error');
    } catch (err: any) {
      if (err.name === 'NotAllowedError') showToast(t('common.cancel'), 'info');
      else showToast('Setup failed: ' + (err.message || err.name || 'Unknown'), 'error');
    } finally { setBiometricBusy(false); }
  };

  const disableBiometric = async () => {
    if (biometricBusy) return;
    setBiometricBusy(true);
    try {
      const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'auth', payload: { action: 'settings', email: selectedIndividual.email, biometricActive: false } }) });
      const data = await res.json();
      if (data.success) {
        setSelectedIndividual({ ...selectedIndividual, biometricActive: false });
        showToast(t('profile.enableBiometrics'), 'info');
      } else showToast('Failed to disable: ' + (data.error || 'Unknown'), 'error');
    } catch (err: any) { showToast('Error: ' + err.message, 'error'); } 
    finally { setBiometricBusy(false); }
  };

  const handleBiometricToggle = async () => {
    if (selectedIndividual.biometricActive) await disableBiometric();
    else await enableBiometric();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'auth', payload: { action: 'upload-avatar', email: selectedIndividual.email, imageData: base64String } }) });
        const data = await res.json();
        if (data.success) {
          setSelectedIndividual(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
          showToast('Profile picture updated!', 'success');
        } else showToast('Upload failed: ' + (data.error || 'Unknown error'), 'error');
        setAvatarUploading(false);
      };
      reader.onerror = () => { showToast('Failed to read file', 'error'); setAvatarUploading(false); };
    } catch (err: any) { showToast('Upload failed: ' + err.message, 'error'); setAvatarUploading(false); } 
    finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    const google = (window as any).google;
    if (google?.accounts?.id) google.accounts.id.disableAutoSelect();
    setAuthMode('login');
  };

  return {
    authMode, setAuthMode, loginEmail, setLoginEmail, twoFaCode, setTwoFaCode,
    authLoading, authError, biometricLoginAvailable, biometricAuthenticating,
    selectedIndividual, setSelectedIndividual, biometricSupported, biometricBusy,
    avatarUploading, fileInputRef, handleSendCode, handleVerifyCode, 
    handleGoogleCredentialResponse, handleBiometricLogin, handleSaveProfile,
    handleBiometricToggle, handleAvatarUpload, handleLogout
  };
};