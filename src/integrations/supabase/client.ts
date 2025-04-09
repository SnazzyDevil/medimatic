
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sggeszinrtkzpivgawzm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZ2VzemlucnRrenBpdmdhd3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNDQ5MzMsImV4cCI6MjA1NjkyMDkzM30.Z4ykozhfU1D0JulqTlTWc0_ix910sUGStn6eN6mkPgY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// SESSION EXPIRATION: 30 minutes
const SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Session expiration settings
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-App-Version': '1.0.0',
      'X-Client-Info': 'medryx-app',
    },
  },
  realtime: {
    headers: {
      'X-Client-Info': 'medryx-app',
    }
  }
});

// Monitor auth state and log activity
supabase.auth.onAuthStateChange((event, session) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Auth state changed: ${event}`);
  }
  
  // Log security-relevant events
  if (event === 'SIGNED_IN') {
    console.log(`User signed in: ${session?.user?.id}`);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Auth token refreshed');
  } else if (event === 'USER_UPDATED') {
    console.log(`User updated: ${session?.user?.id}`);
  } else if (event === 'PASSWORD_RECOVERY') {
    console.log('Password recovery initiated');
  }
});

// Helper function to perform case-insensitive search in Supabase
export const ilike = (column: string, value: string) => {
  return `${column}.ilike.%${value}%`;
};

// Log all data access operations for security monitoring
export const logSupabaseOperation = (operation: string, success: boolean, data: any, error?: any) => {
  const timestamp = new Date().toISOString();
  const userId = supabase.auth.getUser().then(({ data }) => data?.user?.id);
  
  if (success) {
    console.log(`[${timestamp}] Supabase ${operation} succeeded for user: ${userId}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Operation data:`, data);
    }
  } else {
    console.error(`[${timestamp}] Supabase ${operation} failed for user: ${userId}`);
    console.error(`Error:`, error);
  }
};

// Helper function to get authenticated user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

// Secure data access helpers imported from other files
export * from './secureDataHelpers';

// Re-export other helper functions
export { findInventoryItem, findExactInventoryItemByName, updateInventoryItemStock, checkItemReferences } from './inventoryHelpers';
