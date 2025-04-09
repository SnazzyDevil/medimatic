
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Define the valid table names from our Database type
type TableNames = keyof Database['public']['Tables'];
type TablesInsert<T extends TableNames> = Database['public']['Tables'][T]['Insert'];
type TablesRow<T extends TableNames> = Database['public']['Tables'][T]['Row'];
type TablesUpdate<T extends TableNames> = Database['public']['Tables'][T]['Update'];

// Custom error class for access violations
export class AccessDeniedError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

// Generic service for secure data operations
export class SecureDataService {
  static async handleError(error: any, operation: string) {
    console.error(`Error in ${operation}:`, error);
    
    // Check if it's a permissions error
    if (error.code === "PGRST116" || error.message?.includes("permission denied")) {
      // Log unauthorized access attempt
      console.error("Unauthorized data access attempt:", { operation });
      throw new AccessDeniedError();
    }
    
    throw error;
  }
  
  // Fetch data securely (with automatic user_id filtering via RLS)
  static async fetchSecure<T extends TableNames>(
    table: T, 
    query: { 
      select?: string, 
      filter?: Record<string, any>, 
      order?: { column: string, ascending: boolean } 
    } = {}, 
    options: { single?: boolean } = {}
  ): Promise<TablesRow<T> | TablesRow<T>[] | null> {
    try {
      // Start with the base query
      let queryBuilder = supabase.from(table).select(query.select || "*");
      
      // Apply filters if provided
      if (query.filter) {
        Object.entries(query.filter).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key as any, value);
        });
      }
      
      // Apply order if provided
      if (query.order) {
        const { column, ascending } = query.order;
        queryBuilder = queryBuilder.order(column, { ascending });
      }
      
      // Get the data
      const { data, error } = options.single 
        ? await queryBuilder.maybeSingle() 
        : await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return data as TablesRow<T> | TablesRow<T>[] | null;
    } catch (error: any) {
      this.handleError(error, `fetchSecure from ${table}`);
      return null;
    }
  }
  
  // Insert data securely
  static async insertSecure<T extends TableNames>(
    table: T,
    data: TablesInsert<T>,
  ): Promise<TablesRow<T> | null> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data as any])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result as TablesRow<T>;
    } catch (error: any) {
      this.handleError(error, `insertSecure into ${table}`);
      return null;
    }
  }
  
  // Update data securely
  static async updateSecure<T extends TableNames>(
    table: T,
    id: string,
    data: TablesUpdate<T>,
  ): Promise<TablesRow<T> | null> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data as any)
        .eq('id' as any, id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result as TablesRow<T>;
    } catch (error: any) {
      this.handleError(error, `updateSecure in ${table}`);
      return null;
    }
  }
  
  // Delete data securely
  static async deleteSecure<T extends TableNames>(
    table: T,
    id: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id' as any, id);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      this.handleError(error, `deleteSecure from ${table}`);
      return false;
    }
  }
}
