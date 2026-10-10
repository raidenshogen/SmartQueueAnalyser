import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import db from "../db.js"; // Adjust path as needed
import { sendVerificationEmail } from "../services/mailer";

const JWT_SECRET = process.env.JWT_SECRET || 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890abcdefABCDEFGH';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "397060142439-873lntr44bi1auff9m44fafkv1jlethd.apps.googleusercontent.com");

const normalizeBase64Url = (str: string) => str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

export async function handleAuthRequest(payload: any): Promise<any> {
  // ==========================================
  // SEND CODE
  // ==========================================
  if (payload.action === 'send-code') {
    try {
      const { email } = payload;
      let user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        const randomPass = crypto.randomBytes(16).toString('hex');
        const hash = await bcrypt.hash(randomPass, 10);
        const name = email.split('@')[0];
        const result = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(email, hash, name, 'Director');
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      db.prepare('INSERT INTO mfa_codes (userId, code, expiresAt) VALUES (?, ?, ?)').run(user.id, code, expiresAt.toISOString());
      sendVerificationEmail(email, code);
      return { 
        success: true, email: user.email,
        user: { id: user.id, name: user.name, role: user.role, biometricActive: user.biometricActive }
      };
    } catch (err: any) { return { success: false, error: err.message }; }
  }

  // ==========================================
  // VERIFY CODE
  // ==========================================
  if (payload.action === 'verify-code') {
    try {
      const { email, code } = payload;
      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) return { success: false, error: 'User not found' };
      const mfaCode: any = db.prepare('SELECT * FROM mfa_codes WHERE userId = ? AND code = ? AND expiresAt > ?').get(user.id, code, new Date().toISOString());
      if (!mfaCode) return { success: false, error: 'Invalid or expired code' };
      db.prepare('DELETE FROM mfa_codes WHERE id = ?').run(mfaCode.id);
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      return { success: true, token, user };
    } catch (err: any) { return { success: false, error: err.message }; }
  }

  // ==========================================
  // GOOGLE AUTH
  // ==========================================
  if (payload.action === 'google') {
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: payload.credential, audience: process.env.GOOGLE_CLIENT_ID });
      const pGoogle = ticket.getPayload();
      if (!pGoogle?.email) return { success: false, error: 'Invalid Google Identity' };
      let user: any = db.prepare('SELECT * FROM users WHERE email = ? OR googleId = ?').get(pGoogle.email, pGoogle.sub);
      if (!user) {
        const hash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
        const result = db.prepare('INSERT INTO users (email, password, name, avatarUrl, googleId) VALUES (?, ?, ?, ?, ?)').run(pGoogle.email, hash, pGoogle.name, pGoogle.picture, pGoogle.sub);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
      return { success: true, token, user };
    } catch (err: any) { return { success: false, error: err.message }; }
  }

  // ==========================================
  // BIOMETRIC REGISTER
  // ==========================================
  if (payload.action === 'biometric-register') {
    try {
      const { email, publicKey, credentialId } = payload;
      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) return { success: false, error: 'User not found' };

      const cleanCredentialId = normalizeBase64Url(credentialId);
      const existing = db.prepare('SELECT id FROM webauthn_credentials WHERE credentialId = ?').get(cleanCredentialId);
      if (existing) return { success: true, message: 'Credential already registered' };

      db.prepare('INSERT INTO webauthn_credentials (userId, credentialId, publicKey, counter) VALUES (?, ?, ?, ?)').run(user.id, cleanCredentialId, publicKey, 0);
      db.prepare('UPDATE users SET biometricActive = 1 WHERE id = ?').run(user.id);
      return { success: true };
    } catch (err: any) { return { success: false, error: err.message }; }
  }

  // ==========================================
  // BIOMETRIC VERIFY
  // ==========================================
  if (payload.action === 'biometric-verify') {
    try {
      const { email, credentialId } = payload;
      const cleanCredentialId = normalizeBase64Url(credentialId);
      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) return { success: false, error: 'User not found' };
      
      const cred = db.prepare('SELECT * FROM webauthn_credentials WHERE userId = ? AND credentialId = ?').get(user.id, cleanCredentialId);
      if (!cred) return { success: false, error: 'Biometric credential not found' };

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      return { success: true, token, user };
    } catch (err: any) { return { success: false, error: err.message }; }
  }

  // ==========================================
  // SETTINGS
  // ==========================================
  if (payload.action === 'settings') {
    try {
      const { email, mfaActive, biometricActive, avatarUrl } = payload;
      db.prepare('UPDATE users SET mfaActive = ?, biometricActive = ?, avatarUrl = ? WHERE email = ?').run(mfaActive ? 1 : 0, biometricActive ? 1 : 0, avatarUrl || null, email);
      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      return { success: true, user };
    } catch (err: any) { return { success: false, error: err.message }; }
  }

  // ==========================================
  // UPLOAD AVATAR
  // ==========================================
  if (payload.action === 'upload-avatar') {
    try {
      const { email, imageData } = payload;
      if (!email || !imageData) return { success: false, error: 'Missing email or image data' };
      db.prepare('UPDATE users SET avatarUrl = ? WHERE email = ?').run(imageData, email);
      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      return { success: true, avatarUrl: user.avatarUrl };
    } catch (err: any) { return { success: false, error: err.message }; }
  }

  return { success: false, error: 'Unknown action' };
}