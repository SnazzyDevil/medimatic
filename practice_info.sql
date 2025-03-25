-- Create an enum for practice types
CREATE TYPE practice_type AS ENUM ('medical', 'dental', 'pharmacy', 'clinic', 'hospital', 'other');

-- Create the practice_information table
CREATE TABLE IF NOT EXISTS practice_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    practice_type practice_type NOT NULL DEFAULT 'medical',
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    vat_number VARCHAR(50),
    
    -- Contact Information
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    website VARCHAR(255),
    
    -- Address Information
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'South Africa',
    
    -- Media
    logo_url TEXT,
    practice_image_url TEXT,
    
    -- Business Information
    business_hours JSONB,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
    tax_percentage DECIMAL(5,2) DEFAULT 15.00,
    
    -- Settings and Preferences
    appointment_reminder_enabled BOOLEAN DEFAULT true,
    sms_notifications_enabled BOOLEAN DEFAULT true,
    email_notifications_enabled BOOLEAN DEFAULT true,
    two_factor_auth_required BOOLEAN DEFAULT false,
    
    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata/Additional Settings
    settings JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create an index on frequently searched fields
CREATE INDEX idx_practice_info_name ON practice_information(name);
CREATE INDEX idx_practice_info_registration ON practice_information(registration_number);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_practice_info_updated_at
    BEFORE UPDATE ON practice_information
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE practice_information ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON practice_information
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON practice_information
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update for practice owners" ON practice_information
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Insert default data if needed (optional)
INSERT INTO practice_information (
    name,
    practice_type,
    registration_number,
    vat_number,
    email,
    phone,
    website,
    address_line1,
    city,
    postal_code,
    currency,
    created_by
) VALUES (
    'PharmaCare Clinic',
    'clinic',
    'REG-12345-ZA',
    'VAT4567890123',
    'info@pharmacare.co.za',
    '+27 12 345 6789',
    'www.pharmacare.co.za',
    '123 Healthcare Avenue, Medical District',
    'Pretoria',
    '12345',
    'ZAR',
    auth.uid()
) ON CONFLICT DO NOTHING; 