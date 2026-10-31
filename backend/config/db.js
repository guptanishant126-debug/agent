import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serverless-aware directory: Vercel lambda filesystem is read-only except for /tmp
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const fallbackDir = isServerless
  ? path.join('/tmp', 'sahayak_data')
  : path.join(__dirname, '..', 'data');

if (!fs.existsSync(fallbackDir)) {
  try {
    fs.mkdirSync(fallbackDir, { recursive: true });
  } catch (err) {
    console.warn('Directory creation deferred:', err.message);
  }
}
const fallbackDbPath = path.join(fallbackDir, 'fallback_db.json');

const loadFallbackData = () => {
  if (fs.existsSync(fallbackDbPath)) {
    try {
      return JSON.parse(fs.readFileSync(fallbackDbPath, 'utf8'));
    } catch {
      // ignore
    }
  }
  return {
    users: [],
    consultations: [],
    scam_reports: [],
    grievances: []
  };
};

const saveFallbackData = (data) => {
  try {
    fs.writeFileSync(fallbackDbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save fallback data:', err);
  }
};

let isPostgresConnected = false;
let realPool = null;
let dbInitialized = false;

const connectionString = process.env.DATABASE_URL || '';
const isLocalhostDb = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

// Only initialize PostgreSQL client if a remote connection string is provided in serverless,
// or if running locally with Postgres configured
if (connectionString && (!isServerless || !isLocalhostDb)) {
  try {
    realPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
      max: 5,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  } catch (err) {
    console.warn('Postgres client initialization deferred:', err.message);
  }
}

export const initDb = async () => {
  if (dbInitialized) return;
  dbInitialized = true;

  if (!realPool) {
    console.log('📁 Using persistent resilient storage in ' + fallbackDbPath);
    return;
  }

  try {
    const client = await realPool.connect();
    isPostgresConnected = true;
    console.log('✅ Connected successfully to PostgreSQL database.');

    // Execute Production SQL Migration
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          preferred_language VARCHAR(50) DEFAULT 'en',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS consultations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          domain VARCHAR(100) NOT NULL,
          input_type VARCHAR(50) NOT NULL,
          raw_input TEXT,
          media_url TEXT,
          ai_response JSONB NOT NULL,
          status VARCHAR(50) DEFAULT 'completed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS scam_reports (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          suspect_identifier VARCHAR(255) NOT NULL,
          scam_type VARCHAR(100) NOT NULL,
          risk_score INTEGER NOT NULL,
          analysis_details JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS grievances (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          incident_summary TEXT NOT NULL,
          complaint_draft TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_consultations_user ON consultations(user_id);
      CREATE INDEX IF NOT EXISTS idx_scam_reports_user ON scam_reports(user_id);
      CREATE INDEX IF NOT EXISTS idx_grievances_user ON grievances(user_id);
    `);
    console.log('✅ PostgreSQL Schema and Indexes verified.');
    client.release();
  } catch (err) {
    isPostgresConnected = false;
    console.warn('⚠️ PostgreSQL connection failed (' + err.message + ').');
    console.warn('📁 Activating persistent resilient fallback storage in ' + fallbackDbPath);
  }
};

/**
 * Universal query runner: routes to real PostgreSQL pool when connected,
 * or handles query in resilient fallback store.
 */
export const query = async (text, params = []) => {
  if (isPostgresConnected && realPool) {
    try {
      return await realPool.query(text, params);
    } catch (err) {
      console.warn('Postgres query error, attempting fallback:', err.message);
    }
  }

  // Fallback engine handling for core tables
  const dbData = loadFallbackData();
  const normalized = text.trim();

  // 1. SELECT FROM users WHERE email = $1
  if (normalized.includes('FROM users') && normalized.includes('WHERE email = $1')) {
    const email = params[0]?.toLowerCase();
    const user = dbData.users.find(u => u.email?.toLowerCase() === email);
    return { rows: user ? [user] : [] };
  }

  // 2. SELECT FROM users WHERE id = $1
  if (normalized.includes('FROM users') && normalized.includes('WHERE id = $1')) {
    const id = params[0];
    const user = dbData.users.find(u => u.id === id);
    return { rows: user ? [user] : [] };
  }

  // 3. INSERT INTO users
  if (normalized.startsWith('INSERT INTO users')) {
    const [name, email, password_hash, phone, preferred_language] = params;
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password_hash,
      phone: phone || null,
      preferred_language: preferred_language || 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbData.users.push(newUser);
    saveFallbackData(dbData);
    return { rows: [newUser] };
  }

  // 4. UPDATE users (preferred_language, name, phone)
  if (normalized.startsWith('UPDATE users')) {
    const id = params[params.length - 1];
    const userIndex = dbData.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      if (params.length === 4) {
        dbData.users[userIndex].name = params[0] || dbData.users[userIndex].name;
        dbData.users[userIndex].phone = params[1] || dbData.users[userIndex].phone;
        dbData.users[userIndex].preferred_language = params[2] || dbData.users[userIndex].preferred_language;
      }
      dbData.users[userIndex].updated_at = new Date().toISOString();
      saveFallbackData(dbData);
      return { rows: [dbData.users[userIndex]] };
    }
    return { rows: [] };
  }

  // 5. INSERT INTO consultations
  if (normalized.startsWith('INSERT INTO consultations')) {
    const [user_id, domain, input_type, raw_input, media_url, ai_response, status] = params;
    const newConsultation = {
      id: crypto.randomUUID(),
      user_id,
      domain,
      input_type,
      raw_input,
      media_url,
      ai_response: typeof ai_response === 'string' ? JSON.parse(ai_response) : ai_response,
      status: status || 'completed',
      created_at: new Date().toISOString()
    };
    dbData.consultations.unshift(newConsultation);
    saveFallbackData(dbData);
    return { rows: [newConsultation] };
  }

  // 6. SELECT FROM consultations WHERE user_id = $1
  if (normalized.includes('FROM consultations') && normalized.includes('WHERE user_id = $1')) {
    const userId = params[0];
    const rows = dbData.consultations.filter(c => c.user_id === userId);
    return { rows };
  }

  // 7. INSERT INTO scam_reports
  if (normalized.startsWith('INSERT INTO scam_reports')) {
    const [user_id, suspect_identifier, scam_type, risk_score, analysis_details] = params;
    const newReport = {
      id: crypto.randomUUID(),
      user_id,
      suspect_identifier,
      scam_type,
      risk_score: Number(risk_score),
      analysis_details: typeof analysis_details === 'string' ? JSON.parse(analysis_details) : analysis_details,
      created_at: new Date().toISOString()
    };
    dbData.scam_reports.unshift(newReport);
    saveFallbackData(dbData);
    return { rows: [newReport] };
  }

  // 8. SELECT FROM scam_reports WHERE user_id = $1
  if (normalized.includes('FROM scam_reports') && normalized.includes('WHERE user_id = $1')) {
    const userId = params[0];
    const rows = dbData.scam_reports.filter(r => r.user_id === userId);
    return { rows };
  }

  // 9. SELECT all public scam alerts for community ticker
  if (normalized.includes('FROM scam_reports') && !normalized.includes('WHERE user_id = $1')) {
    return { rows: dbData.scam_reports.slice(0, 10) };
  }

  // 10. INSERT INTO grievances
  if (normalized.startsWith('INSERT INTO grievances')) {
    const [user_id, incident_summary, complaint_draft, status] = params;
    const newGrievance = {
      id: crypto.randomUUID(),
      user_id,
      incident_summary,
      complaint_draft,
      status: status || 'draft',
      created_at: new Date().toISOString()
    };
    dbData.grievances.unshift(newGrievance);
    saveFallbackData(dbData);
    return { rows: [newGrievance] };
  }

  // 11. UPDATE grievances SET status = $1 WHERE id = $2 AND user_id = $3
  if (normalized.startsWith('UPDATE grievances')) {
    const [status, id, user_id] = params;
    const gIndex = dbData.grievances.findIndex(g => g.id === id && g.user_id === user_id);
    if (gIndex !== -1) {
      dbData.grievances[gIndex].status = status;
      saveFallbackData(dbData);
      return { rows: [dbData.grievances[gIndex]] };
    }
    return { rows: [] };
  }

  // 12. SELECT FROM grievances WHERE user_id = $1
  if (normalized.includes('FROM grievances') && normalized.includes('WHERE user_id = $1')) {
    const userId = params[0];
    const rows = dbData.grievances.filter(g => g.user_id === userId);
    return { rows };
  }

  return { rows: [] };
};

export default {
  query,
  initDb
};
