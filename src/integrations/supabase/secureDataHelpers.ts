
import { supabase } from './client';
import type { Database } from './types';

type TableNames = keyof Database['public']['Tables'];

// Class for handling access denied errors
export class AccessDeniedError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "AccessDeniedError";
    
    // Log security incident
    console.error(`[SECURITY] Access denied: ${message}`);
  }
}

// Helper to check if a user is authenticated
const checkAuthentication = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new AccessDeniedError("Authentication required");
  }
  
  return user;
};

// Generic secure data operations with proper typing
export const secureSelect = async <T = any>(
  table: TableNames,
  columns: string = '*',
  filters: Record<string, any> = {}
): Promise<T[]> => {
  try {
    // First check authentication
    const user = await checkAuthentication();
    
    // Build the query
    let query = supabase.from(table).select(columns);
    
    // Apply all filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        throw new AccessDeniedError();
      }
      throw error;
    }
    
    return (data || []) as T[];
  } catch (error) {
    console.error(`Error in secureSelect from ${table}:`, error);
    throw error;
  }
};

// Secure insert operation with proper typing
export const secureInsert = async <T = any>(
  table: TableNames,
  data: Record<string, any>,
): Promise<T> => {
  try {
    // First check authentication
    await checkAuthentication();
    
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        throw new AccessDeniedError();
      }
      throw error;
    }
    
    return result as T;
  } catch (error) {
    console.error(`Error in secureInsert into ${table}:`, error);
    throw error;
  }
};

// Secure update operation with proper typing
export const secureUpdate = async <T = any>(
  table: TableNames,
  id: string,
  data: Record<string, any>,
): Promise<T> => {
  try {
    // First check authentication
    await checkAuthentication();
    
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        throw new AccessDeniedError(`You do not have permission to update this record in ${table}`);
      }
      throw error;
    }
    
    if (!result) {
      throw new AccessDeniedError(`Record not found or you don't have permission to update it`);
    }
    
    return result as T;
  } catch (error) {
    console.error(`Error in secureUpdate for ${table}:`, error);
    throw error;
  }
};

// Secure delete operation
export const secureDelete = async (
  table: TableNames,
  id: string,
): Promise<boolean> => {
  try {
    // First check authentication
    await checkAuthentication();
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        throw new AccessDeniedError(`You do not have permission to delete this record in ${table}`);
      }
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in secureDelete for ${table}:`, error);
    throw error;
  }
};
