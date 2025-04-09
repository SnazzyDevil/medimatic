
import { supabase } from './client';

// Class for handling access denied errors
export class AccessDeniedError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "AccessDeniedError";
    
    // Log security incident
    console.error(`[SECURITY] Access denied: ${message}`);
  }
}

// Generic secure data operations
export const secureSelect = async (
  table: string, 
  columns: string = '*', 
  filters: Record<string, any> = {}
) => {
  try {
    // First check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new AccessDeniedError("Authentication required");
    }
    
    // Add user_id filter if table has owner_id
    const hasOwnerColumn = await checkTableHasColumn(table, 'owner_id');
    const hasUserColumn = await checkTableHasColumn(table, 'user_id');
    const hasCreatedByColumn = await checkTableHasColumn(table, 'created_by');
    
    let query = supabase.from(table).select(columns);
    
    // Apply all filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Add user based filter if applicable
    if (hasOwnerColumn) {
      query = query.eq('owner_id', user.id);
    } else if (hasUserColumn) {
      query = query.eq('user_id', user.id);
    } else if (hasCreatedByColumn) {
      query = query.eq('created_by', user.id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        throw new AccessDeniedError();
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in secureSelect from ${table}:`, error);
    throw error;
  }
};

// Helper to check if a table has a specific column
const checkTableHasColumn = async (table: string, columnName: string): Promise<boolean> => {
  // In a real implementation, we would check the database schema
  // For now, we'll use a simple approach based on common column names
  const userIdColumns = ['user_id', 'owner_id', 'created_by'];
  return userIdColumns.includes(columnName);
};

// Secure insert operation
export const secureInsert = async <T extends Record<string, any>>(
  table: string,
  data: T,
) => {
  try {
    // First check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new AccessDeniedError("Authentication required");
    }
    
    // Add user_id to data if table has owner_id
    const hasOwnerColumn = await checkTableHasColumn(table, 'owner_id');
    const hasUserColumn = await checkTableHasColumn(table, 'user_id');
    const hasCreatedByColumn = await checkTableHasColumn(table, 'created_by');
    
    let dataWithUser = { ...data };
    
    if (hasOwnerColumn) {
      dataWithUser.owner_id = user.id;
    } 
    
    if (hasUserColumn) {
      dataWithUser.user_id = user.id;
    }
    
    if (hasCreatedByColumn) {
      dataWithUser.created_by = user.id;
    }
    
    const { data: result, error } = await supabase
      .from(table)
      .insert([dataWithUser])
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        throw new AccessDeniedError();
      }
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error(`Error in secureInsert into ${table}:`, error);
    throw error;
  }
};

// Secure update operation
export const secureUpdate = async <T extends Record<string, any>>(
  table: string,
  id: string,
  data: T,
) => {
  try {
    // First check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new AccessDeniedError("Authentication required");
    }
    
    // Check if this record belongs to the user
    const hasOwnerColumn = await checkTableHasColumn(table, 'owner_id');
    const hasUserColumn = await checkTableHasColumn(table, 'user_id');
    const hasCreatedByColumn = await checkTableHasColumn(table, 'created_by');
    
    let query = supabase.from(table).update(data);
    
    // Add user based filter
    if (hasOwnerColumn) {
      query = query.eq('owner_id', user.id);
    } else if (hasUserColumn) {
      query = query.eq('user_id', user.id);
    } else if (hasCreatedByColumn) {
      query = query.eq('created_by', user.id);
    }
    
    // Add ID filter
    query = query.eq('id', id);
    
    const { data: result, error } = await query.select().single();
    
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        throw new AccessDeniedError(`You do not have permission to update this record in ${table}`);
      }
      throw error;
    }
    
    if (!result) {
      throw new AccessDeniedError(`Record not found or you don't have permission to update it`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error in secureUpdate for ${table}:`, error);
    throw error;
  }
};

// Secure delete operation
export const secureDelete = async (
  table: string,
  id: string,
) => {
  try {
    // First check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new AccessDeniedError("Authentication required");
    }
    
    // Check if this record belongs to the user
    const hasOwnerColumn = await checkTableHasColumn(table, 'owner_id');
    const hasUserColumn = await checkTableHasColumn(table, 'user_id');
    const hasCreatedByColumn = await checkTableHasColumn(table, 'created_by');
    
    let query = supabase.from(table).delete();
    
    // Add user based filter
    if (hasOwnerColumn) {
      query = query.eq('owner_id', user.id);
    } else if (hasUserColumn) {
      query = query.eq('user_id', user.id);
    } else if (hasCreatedByColumn) {
      query = query.eq('created_by', user.id);
    }
    
    // Add ID filter
    query = query.eq('id', id);
    
    const { error } = await query;
    
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
