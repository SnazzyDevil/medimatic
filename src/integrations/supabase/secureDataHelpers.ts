
import { supabase } from './client';
import type { Database } from './types';

// Define the valid table names from our Database type
export type TableNames = keyof Database['public']['Tables'];
export type TablesInsert<T extends TableNames> = Database['public']['Tables'][T]['Insert'];
export type TablesRow<T extends TableNames> = Database['public']['Tables'][T]['Row'];

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

// Simplified secure select operation with proper typing
export const secureSelect = async <T extends TableNames>(
  table: T,
  columns: string = '*',
  filters: Record<string, any> = {}
): Promise<TablesRow<T>[]> => {
  try {
    // First check authentication
    await checkAuthentication();
    
    // Build the query
    let query = supabase.from(table).select(columns);
    
    // Apply all filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key as any, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        throw new AccessDeniedError();
      }
      throw error;
    }
    
    // Use type assertion here as we know the structure matches
    return (data || []) as unknown as TablesRow<T>[];
  } catch (error) {
    console.error(`Error in secureSelect from ${table}:`, error);
    throw error;
  }
};

// Simplified secure insert operation with proper typing
export const secureInsert = async <T extends TableNames>(
  table: T,
  data: TablesInsert<T> | TablesInsert<T>[]
): Promise<TablesRow<T>> => {
  try {
    // First check authentication
    await checkAuthentication();
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(data as any)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        throw new AccessDeniedError();
      }
      throw error;
    }
    
    if (!result) {
      throw new Error(`Failed to insert data into ${table}`);
    }
    
    // Use type assertion as we know the structure
    return result as unknown as TablesRow<T>;
  } catch (error) {
    console.error(`Error in secureInsert into ${table}:`, error);
    throw error;
  }
};

// Simplified secure update operation with proper typing
export const secureUpdate = async <T extends TableNames>(
  table: T,
  id: string,
  data: Partial<TablesInsert<T>>
): Promise<TablesRow<T>> => {
  try {
    // First check authentication
    await checkAuthentication();
    
    const { data: result, error } = await supabase
      .from(table)
      .update(data as any)
      .eq('id' as any, id)
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
    
    // Use type assertion as we know the structure
    return result as unknown as TablesRow<T>;
  } catch (error) {
    console.error(`Error in secureUpdate for ${table}:`, error);
    throw error;
  }
};

// Simplified secure delete operation
export const secureDelete = async <T extends TableNames>(
  table: T,
  id: string
): Promise<boolean> => {
  try {
    // First check authentication
    await checkAuthentication();
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id' as any, id);
    
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
