import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://esm.sh/jose@4.14.4";

// JWT Secret for signing tokens (use environment variables in production)
const JWT_SECRET = Deno.env.get('JWT_SECRET') || "your_secure_jwt_secret_change_in_production";
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "";

// Token duration: 1 hour (in seconds) - following your other functions
const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Access-Control-Max-Age": "86400"
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log("⭐️ Starting auth function - Current Time:", new Date().toISOString());
    console.log("🌐 Request URL:", req.url);
    console.log("🔀 Request method:", req.method);
    
    // Only accept POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({
        error: "Method not allowed"
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const requestBody = await req.json();
    const { 
      action, 
      email, 
      password, 
      token, 
      refresh_token, 
      code, 
      factorId, 
      challengeId, 
      verificationCode,
      firstName,
      lastName,
      role: requestedRole 
    } = requestBody;

    console.log(`🔄 Processing action: ${action}`);
    console.log(`📋 Request body keys: ${Object.keys(requestBody).join(', ')}`);

    // Switch between different authentication actions
    switch (action) {
      case "signin": {
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        console.log(`🔐 Attempting signin for email: ${email}`);

        // Login with email/password using admin client to bypass RLS
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError || !authData.user) {
          console.error("❌ Signin error:", authError);
          throw new Error("Invalid credentials");
        }

        const user = authData.user;
        console.log(`👤 User authenticated: ${user.id}`);

        // Get user role using direct query instead of RPC
        const { data: roleData, error: roleError } = await supabase
          .from('auth_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError || !roleData) {
          console.error("❌ Role error:", roleError);
          throw new Error("User has no assigned role");
        }

        console.log(`🔑 User role: ${roleData.role}`);

        // Check if user has MFA enabled by getting session with proper auth
        const { data: sessionData } = await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token
        });

        let hasVerifiedFactors = false;
        try {
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          hasVerifiedFactors = factorsData?.totp?.some(f => f.status === 'verified') || 
                              factorsData?.phone?.some(f => f.status === 'verified');
        } catch (mfaError) {
          console.log("ℹ️ No MFA factors found or error checking:", mfaError.message);
        }

        // Generate custom tokens with proper AAL level
        const currentAAL = hasVerifiedFactors ? 'aal1' : 'aal1'; // Start with aal1, upgrade to aal2 after MFA verification
        const accessToken = await generateAccessToken(user.id, roleData.role, currentAAL);
        const refreshToken = await generateRefreshToken(user.id);

        return new Response(JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            role: roleData.role,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null
          },
          accessToken,
          refreshToken,
          mfaRequired: hasVerifiedFactors,
          needsMFA: hasVerifiedFactors
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }

      case "google-signin": {
        console.log("🔄 Initiating Google OAuth flow");
        
        const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://eventlyuq.vercel.app';
        const redirectTo = `${origin}/auth/callback`;
        
        console.log(`🔗 Redirect URL: ${redirectTo}`);

        // Iniciar flujo de OAuth con Google
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });

        if (error) {
          console.error("❌ Google OAuth error:", error);
          throw error;
        }

        console.log("✅ Google OAuth URL generated");

        return new Response(JSON.stringify({
          data,
          redirectUrl: data.url
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }

      case "google-callback": {
        if (!code) {
          throw new Error("Authorization code is required");
        }

        console.log(`🔄 Processing Google callback with code: ${code.substring(0, 20)}...`);

        try {
          // Exchange code for session
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (sessionError) {
            console.error("❌ Session exchange error:", sessionError);
            throw new Error(`Failed to exchange code for session: ${sessionError.message}`);
          }

          if (!sessionData?.user) {
            throw new Error("No user data received from Google");
          }

          const user = sessionData.user;
          console.log(`👤 Google user authenticated: ${user.id}, email: ${user.email}`);

          // Verificar que las tablas existan antes de intentar usarlas
          console.log("🔍 Checking if auth_roles table exists...");
          
          // Check if user already has a role using direct query
          const { data: existingRole, error: roleCheckError } = await supabase
            .from('auth_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();

          if (roleCheckError && roleCheckError.code === '42P01') {
            console.error("❌ Table auth_roles does not exist! Please run the setup SQL first.");
            throw new Error("Database tables not set up. Please contact administrator.");
          }

          let userRole = existingRole?.role;

          // If no role exists, assign 'user' role automatically for Google users
          if (!userRole) {
            console.log(`🔄 Assigning default 'user' role to new Google user: ${user.id}`);
            
            const { data: insertedRole, error: insertRoleError } = await supabase
              .from('auth_roles')
              .insert({
                user_id: user.id,
                role: 'user'
              })
              .select('role')
              .single();

            if (insertRoleError) {
              console.error("❌ Error inserting role:", insertRoleError);
              
              // Handle duplicate key error (user already has a role)
              if (insertRoleError.code === '23505') {
                const { data: retryRole } = await supabase
                  .from('auth_roles')
                  .select('role')
                  .eq('user_id', user.id)
                  .single();
                
                userRole = retryRole?.role || 'user';
                console.log(`✅ Found existing role: ${userRole}`);
              } else {
                console.error("❌ Detailed role error:", JSON.stringify(insertRoleError, null, 2));
                throw new Error(`Error assigning user role: ${insertRoleError.message}`);
              }
            } else {
              userRole = insertedRole.role;
              console.log(`✅ Role assigned successfully: ${userRole}`);
            }
          } else {
            console.log(`✅ Existing role found: ${userRole}`);
          }

          // Generate custom tokens
          const accessToken = await generateAccessToken(user.id, userRole, 'aal1');
          const refreshTokenCustom = await generateRefreshToken(user.id);

          console.log(`✅ Tokens generated successfully for user: ${user.id}`);

          return new Response(JSON.stringify({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              role: userRole,
              name: user.user_metadata?.full_name || user.user_metadata?.name || null
            },
            accessToken,
            refreshToken: refreshTokenCustom
          }), {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          });

        } catch (exchangeError) {
          console.error("❌ Detailed error in google-callback:", exchangeError);
          console.error("❌ Error stack:", exchangeError.stack);
          throw new Error(`Google authentication failed: ${exchangeError.message}`);
        }
      }

      case "register": {
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const role = requestedRole || 'user'; // Default to 'user' if no role specified
        
        if (!['user', 'owner'].includes(role)) {
          throw new Error("Invalid role. Only 'user' and 'owner' are allowed for registration");
        }

        console.log(`🔄 Registering new user with email: ${email}, role: ${role}`);

        // Create user in Supabase Auth
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: firstName && lastName ? `${firstName} ${lastName}` : null,
            first_name: firstName || null,
            last_name: lastName || null
          }
        });

        if (userError || !userData.user) {
          console.error("❌ User creation error:", userError);
          throw new Error(`Error creating user: ${userError?.message}`);
        }

        console.log(`✅ User created: ${userData.user.id}`);

        // Verificar que la tabla auth_roles existe antes de insertar
        console.log("🔍 Checking if auth_roles table exists for registration...");

        // Assign role
        const { error: roleError } = await supabase
          .from('auth_roles')
          .insert({
            user_id: userData.user.id,
            role: role
          });

        if (roleError) {
          console.error("❌ Role assignment error:", roleError);
          
          if (roleError.code === '42P01') {
            console.error("❌ Table auth_roles does not exist! Please run the setup SQL first.");
            await supabase.auth.admin.deleteUser(userData.user.id);
            throw new Error("Database tables not set up. Please contact administrator.");
          }
          
          // If role assignment fails, delete the created user to maintain consistency
          await supabase.auth.admin.deleteUser(userData.user.id);
          throw new Error(`Error assigning role: ${roleError.message}`);
        }

        console.log(`✅ Role assigned: ${role}`);

        // Generate tokens for immediate login
        const accessToken = await generateAccessToken(userData.user.id, role, 'aal1');
        const refreshTokenCustom = await generateRefreshToken(userData.user.id);

        return new Response(JSON.stringify({
          success: true,
          user: {
            id: userData.user.id,
            email: userData.user.email,
            role: role,
            name: userData.user.user_metadata?.full_name || null
          },
          accessToken,
          refreshToken: refreshTokenCustom
        }), {
          status: 201,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }

      // ... resto de los casos (MFA, etc.) - mantener igual

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error("❌ Auth error:", error);
    console.error("❌ Error stack:", error.stack);
    
    return new Response(JSON.stringify({
      error: error.message || "Server error",
      timestamp: new Date().toISOString(),
      details: error.stack || "No stack trace available"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

// Function to generate JWT access token with AAL support
async function generateAccessToken(userId: string, role: string, aal: string = 'aal1') {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const jwt = await new jose.SignJWT({
    sub: userId,
    role: role,
    aal: aal, // Authenticator Assurance Level
    iat: Math.floor(Date.now() / 1000),
    iss: 'evently-auth',
    aud: 'evently-app'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(secret);
  
  return jwt;
}

// Function to generate refresh token
async function generateRefreshToken(userId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const refreshToken = Array.from(tokenBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
  
  try {
    // Delete existing tokens for this user to prevent token accumulation
    await supabase
      .from('auth_tokens')
      .delete()
      .eq('user_id', userId);
    
    // Insert new token
    const { error } = await supabase
      .from('auth_tokens')
      .insert({
        user_id: userId,
        refresh_token: refreshToken,
        refresh_token_expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      if (error.code === '42P01') {
        console.error("❌ Table auth_tokens does not exist! Please run the setup SQL first.");
        throw new Error("Database tables not set up. Please contact administrator.");
      }
      throw new Error(`Error saving refresh token: ${error.message}`);
    }
  } catch (tokenError) {
    console.error("❌ Error in generateRefreshToken:", tokenError);
    throw new Error(`Error generating refresh token: ${tokenError.message}`);
  }
  
  return refreshToken;
}

// Function to verify JWT access token
async function verifyAccessToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
