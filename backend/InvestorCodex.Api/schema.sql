-- Create database schema for InvestorCodex

-- Drop existing tables if they exist
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS signals;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS companies;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    roles TEXT[] DEFAULT ARRAY['Viewer'],
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    domain VARCHAR(255),
    industry VARCHAR(100),
    location VARCHAR(255),
    headcount INTEGER,
    funding_stage VARCHAR(100),
    summary TEXT,
    investment_score REAL DEFAULT 0.0,
    tags TEXT[],
    risk_flags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255),
    title VARCHAR(150),
    email VARCHAR(255),
    linkedin_url VARCHAR(500),
    persona VARCHAR(100),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    round VARCHAR(100),
    amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    filing_date TIMESTAMP,
    source VARCHAR(255),
    url VARCHAR(500),
    summary TEXT,
    investment_score REAL,
    filing_type VARCHAR(100),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signals table
CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    type VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    source VARCHAR(255),
    url VARCHAR(500),
    severity VARCHAR(50),
    tags TEXT[],
    summary TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confidence REAL DEFAULT 0.0
);

-- Insert some sample data
INSERT INTO users (email, name, roles)
VALUES ('admin@investorcodex.com', 'Admin User', ARRAY['Admin'])
ON CONFLICT DO NOTHING;

INSERT INTO companies (name, domain, industry, location, headcount, funding_stage, summary, investment_score, tags, risk_flags) VALUES
('Apple Inc.', 'apple.com', 'Consumer Electronics', 'Cupertino, CA', 164000, 'Public', 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', 9.5, ARRAY['technology', 'consumer', 'innovation'], ARRAY[]::TEXT[]),
('Microsoft Corporation', 'microsoft.com', 'Software', 'Redmond, WA', 221000, 'Public', 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.', 9.3, ARRAY['technology', 'enterprise', 'cloud'], ARRAY[]::TEXT[]),
('Amazon.com Inc.', 'amazon.com', 'E-commerce', 'Seattle, WA', 1540000, 'Public', 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.', 8.9, ARRAY['e-commerce', 'cloud', 'logistics'], ARRAY[]::TEXT[]),
('Tesla Inc.', 'tesla.com', 'Automotive', 'Austin, TX', 127855, 'Public', 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.', 8.7, ARRAY['automotive', 'electric', 'energy'], ARRAY[]::TEXT[]),
('Alphabet Inc.', 'alphabet.com', 'Internet Services', 'Mountain View, CA', 174014, 'Public', 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.', 9.1, ARRAY['internet', 'advertising', 'ai'], ARRAY[]::TEXT[])
ON CONFLICT DO NOTHING;

INSERT INTO contacts (company_id, name, title, email, linkedin_url, persona, summary) 
SELECT 
    c.id,
    'Tim Cook',
    'Chief Executive Officer',
    'tim.cook@apple.com',
    'https://linkedin.com/in/tim-cook',
    'CEO',
    'CEO of Apple Inc.'
FROM companies c WHERE c.name = 'Apple Inc.'
UNION ALL
SELECT 
    c.id,
    'Satya Nadella',
    'Chief Executive Officer',
    'satya.nadella@microsoft.com',
    'https://linkedin.com/in/satya-nadella',
    'CEO',
    'CEO of Microsoft Corporation'
FROM companies c WHERE c.name = 'Microsoft Corporation'
UNION ALL
SELECT 
    c.id,
    'Andy Jassy',
    'Chief Executive Officer',
    'andy.jassy@amazon.com',
    'https://linkedin.com/in/andy-jassy',
    'CEO',
    'CEO of Amazon.com Inc.'
FROM companies c WHERE c.name = 'Amazon.com Inc.'
UNION ALL
SELECT 
    c.id,
    'Elon Musk',
    'Chief Executive Officer',
    'elon.musk@tesla.com',
    'https://linkedin.com/in/elon-musk',
    'CEO',
    'CEO of Tesla Inc.'
FROM companies c WHERE c.name = 'Tesla Inc.'
UNION ALL
SELECT 
    c.id,
    'Sundar Pichai',
    'Chief Executive Officer',
    'sundar.pichai@alphabet.com',
    'https://linkedin.com/in/sundar-pichai',
    'CEO',
    'CEO of Alphabet Inc.'
FROM companies c WHERE c.name = 'Alphabet Inc.'
ON CONFLICT DO NOTHING;

INSERT INTO investments (company_id, round, amount, currency, filing_date, source, summary, investment_score, filing_type, company)
SELECT 
    c.id,
    'IPO',
    220000000.00,
    'USD',
    '1980-12-12'::timestamp,
    'SEC',
    'Apple went public in 1980',
    9.5,
    'IPO',
    'Apple Inc.'
FROM companies c WHERE c.name = 'Apple Inc.'
UNION ALL
SELECT 
    c.id,
    'IPO',
    61000000.00,
    'USD',
    '1986-03-13'::timestamp,
    'SEC',
    'Microsoft went public in 1986',
    9.3,
    'IPO',
    'Microsoft Corporation'
FROM companies c WHERE c.name = 'Microsoft Corporation'
UNION ALL
SELECT 
    c.id,
    'IPO',
    54000000.00,
    'USD',
    '1997-05-15'::timestamp,
    'SEC',
    'Amazon went public in 1997',
    8.9,
    'IPO',
    'Amazon.com Inc.'
FROM companies c WHERE c.name = 'Amazon.com Inc.'
UNION ALL
SELECT 
    c.id,
    'IPO',
    226000000.00,
    'USD',
    '2010-06-29'::timestamp,
    'SEC',
    'Tesla went public in 2010',
    8.7,
    'IPO',
    'Tesla Inc.'
FROM companies c WHERE c.name = 'Tesla Inc.'
UNION ALL
SELECT 
    c.id,
    'IPO',
    1670000000.00,
    'USD',
    '2004-08-19'::timestamp,
    'SEC',
    'Google went public in 2004',
    9.1,    'IPO',
    'Alphabet Inc.'
FROM companies c WHERE c.name = 'Alphabet Inc.'
ON CONFLICT DO NOTHING;

-- Insert sample signals data
INSERT INTO signals (company_id, type, title, description, source, url, severity, tags, summary, detected_at, processed_at, confidence)
SELECT
    c.id,
    'News',
    'Product Line Expansion',
    'Apple announces new product line expansion',
    'news',
    'https://news.apple.com/product-line',
    'Medium',
    ARRAY['news'],
    'Apple is expanding its product line with new innovative devices',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0.85
FROM companies c WHERE c.name = 'Apple Inc.'
UNION ALL
SELECT
    c.id,
    'Financial',
    'Strong Quarterly Earnings',
    'Microsoft reports strong quarterly earnings',
    'news',
    'https://investor.microsoft.com/earnings',
    'Low',
    ARRAY['finance'],
    'Microsoft exceeded earnings expectations for Q3',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0.6
FROM companies c WHERE c.name = 'Microsoft Corporation'
UNION ALL
SELECT
    c.id,
    'Regulatory',
    'Antitrust Investigation',
    'Amazon faces antitrust investigation',
    'news',
    'https://news.amazon.com/antitrust',
    'High',
    ARRAY['legal'],
    'Amazon is under scrutiny for potential monopolistic practices',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0.9
FROM companies c WHERE c.name = 'Amazon.com Inc.'
UNION ALL
SELECT
    c.id,
    'Technical',
    'Vehicle Software Recall',
    'Tesla recalls vehicles due to software issue',
    'news',
    'https://tesla.com/safety-recall',
    'Medium',
    ARRAY['recall'],
    'Tesla is recalling certain model years due to autopilot software concerns',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0.75
FROM companies c WHERE c.name = 'Tesla Inc.'
UNION ALL
SELECT
    c.id,
    'Leadership',
    'New AI Research Initiative',
    'Google announces new AI research initiative',
    'news',
    'https://ai.google/research',
    'Low',
    ARRAY['ai'],
    'Google is launching a new AI research division focused on ethical AI',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0.7
FROM companies c WHERE c.name = 'Alphabet Inc.'
ON CONFLICT DO NOTHING;

-- Create indexes for performance optimization (from FSD requirements)
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_funding_stage ON companies(funding_stage);
CREATE INDEX IF NOT EXISTS idx_companies_investment_score ON companies(investment_score);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_title ON contacts(title);

CREATE INDEX IF NOT EXISTS idx_investments_company_id ON investments(company_id);
CREATE INDEX IF NOT EXISTS idx_investments_filing_date ON investments(filing_date);
CREATE INDEX IF NOT EXISTS idx_investments_round ON investments(round);
CREATE INDEX IF NOT EXISTS idx_investments_amount ON investments(amount);

CREATE INDEX IF NOT EXISTS idx_signals_company_id ON signals(company_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);
CREATE INDEX IF NOT EXISTS idx_signals_severity ON signals(severity);
CREATE INDEX IF NOT EXISTS idx_signals_confidence ON signals(confidence);
CREATE INDEX IF NOT EXISTS idx_signals_detected_at ON signals(detected_at);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_companies_industry_funding ON companies(industry, funding_stage);
CREATE INDEX IF NOT EXISTS idx_companies_score_industry ON companies(investment_score, industry);

-- Text search indexes (for PostgreSQL full-text search)
CREATE INDEX IF NOT EXISTS idx_companies_name_gin ON companies USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_companies_summary_gin ON companies USING gin(to_tsvector('english', summary));
CREATE INDEX IF NOT EXISTS idx_contacts_name_gin ON contacts USING gin(to_tsvector('english', name));

COMMENT ON INDEX idx_companies_domain IS 'Fast duplicate detection by domain';
COMMENT ON INDEX idx_companies_name IS 'Fast duplicate detection by name';
COMMENT ON INDEX idx_contacts_email IS 'Fast duplicate detection by email';
COMMENT ON INDEX idx_companies_name_gin IS 'Full-text search on company names';
COMMENT ON INDEX idx_companies_summary_gin IS 'Full-text search on company summaries';
