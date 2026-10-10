import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), "src", "server");

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("[Database] Could not verify/create data directory:", e);
}

const dbPath = path.join(DATA_DIR, 'auth.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Initialize database schema
export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'User',
      avatarUrl TEXT,
      mfaActive BOOLEAN DEFAULT 0,
      biometricActive BOOLEAN DEFAULT 0,
      googleId TEXT UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // 2FA codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mfa_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      code TEXT NOT NULL,
      expiresAt DATETIME NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  // WebAuthn credentials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS webauthn_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      credentialId TEXT UNIQUE NOT NULL,
      publicKey TEXT NOT NULL,
      counter INTEGER NOT NULL,
      transports TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  // Magic link tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS magic_link_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt DATETIME NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  console.log('[Database] Initialized auth.sqlite');
}

export default db;
