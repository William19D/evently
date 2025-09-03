-- Create auth_roles table for storing user roles
CREATE TABLE IF NOT EXISTS auth_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'owner', 'superadmin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create auth_tokens table for storing refresh tokens
CREATE TABLE IF NOT EXISTS auth_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    refresh_token TEXT NOT NULL UNIQUE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_roles_user_id ON auth_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_refresh_token ON auth_tokens(refresh_token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(refresh_token_expires_at);

-- Enable RLS
ALTER TABLE auth_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auth_roles
CREATE POLICY "Users can view their own role" ON auth_roles
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for auth_tokens  
CREATE POLICY "Users can view their own tokens" ON auth_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_auth_roles_updated_at 
    BEFORE UPDATE ON auth_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auth_tokens_updated_at 
    BEFORE UPDATE ON auth_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
