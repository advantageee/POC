-- Create database schema for InvestorCodex

-- Drop existing tables if they exist
DROP TABLE IF EXISTS signals;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS companies;

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
    severity VARCHAR(50),
    description TEXT,
    url VARCHAR(500),
    summary TEXT,
    risk_score REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
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
INSERT INTO signals (company_id, type, severity, description, url, summary, risk_score)
SELECT 
    c.id,
    'News',
    'Medium',
    'Apple announces new product line expansion',
    'https://news.apple.com/product-line',
    'Apple is expanding its product line with new innovative devices',
    5.2
FROM companies c WHERE c.name = 'Apple Inc.'
UNION ALL
SELECT 
    c.id,
    'Financial',
    'Low',
    'Microsoft reports strong quarterly earnings',
    'https://investor.microsoft.com/earnings',
    'Microsoft exceeded earnings expectations for Q3',
    2.1
FROM companies c WHERE c.name = 'Microsoft Corporation'
UNION ALL
SELECT 
    c.id,
    'Regulatory',
    'High',
    'Amazon faces antitrust investigation',
    'https://news.amazon.com/antitrust',
    'Amazon is under scrutiny for potential monopolistic practices',
    8.5
FROM companies c WHERE c.name = 'Amazon.com Inc.'
UNION ALL
SELECT 
    c.id,
    'Technical',
    'Medium',
    'Tesla recalls vehicles due to software issue',
    'https://tesla.com/safety-recall',
    'Tesla is recalling certain model years due to autopilot software concerns',
    6.3
FROM companies c WHERE c.name = 'Tesla Inc.'
UNION ALL
SELECT 
    c.id,
    'Leadership',
    'Low',
    'Google announces new AI research initiative',
    'https://ai.google/research',
    'Google is launching a new AI research division focused on ethical AI',
    3.1
FROM companies c WHERE c.name = 'Alphabet Inc.'
ON CONFLICT DO NOTHING;
