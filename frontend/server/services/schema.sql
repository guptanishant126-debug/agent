-- ====================================================================
-- Sahayak AI Database Schema (PostgreSQL 14+)
-- Multimodal AI Advisor & Scam Shield Agent for Underserved Communities
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Stores citizen credentials and language preferences)
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

-- 2. Consultations Table (Multimodal farming, business, and legal queries)
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(100) NOT NULL,
    input_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'audio'
    raw_input TEXT,
    media_url TEXT,
    ai_response JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'completed', -- 'pending_approval', 'completed', 'flagged'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Scam Reports Table (Verification of phishing, SMS, and fake calls)
CREATE TABLE IF NOT EXISTS scam_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    suspect_identifier VARCHAR(255) NOT NULL, -- phone number, URL, or text snippet
    scam_type VARCHAR(100) NOT NULL,
    risk_score INTEGER NOT NULL,
    analysis_details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Grievances Table (Formal cybercrime and consumer helpline filings)
CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    incident_summary TEXT NOT NULL,
    complaint_draft TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row-Level Performance Indexes
CREATE INDEX IF NOT EXISTS idx_consultations_user ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_scam_reports_user ON scam_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_user ON grievances(user_id);

