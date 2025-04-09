
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { TableNames } from "@/integrations/supabase/secureDataHelpers";

// Define a more specific type for custom errors
interface DataServiceError {
  error: true;
  message: string;
}

// Custom error class for access violations
export class AccessDeniedError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

// Generic service for secure data operations
export class SecureDataService {
  static async handleError(error: any, operation: string): Promise<never> {
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
  ): Promise<any> {
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
      if (options.single) {
        const { data, error } = await queryBuilder.maybeSingle();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await queryBuilder;
        if (error) throw error;
        return data;
      }
    } catch (error: any) {
      return this.handleError(error, `fetchSecure from ${table}`);
    }
  }
  
  // Insert data securely with proper typing
  static async insertSecure<T extends TableNames>(
    table: T,
    data: Database['public']['Tables'][T]['Insert'],
  ): Promise<any> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data as any])
        .select()
        .single();
      
      if (error) throw error;
      if (!result) throw new Error(`Failed to insert data into ${table}`);
      
      return result;
    } catch (error: any) {
      return this.handleError(error, `insertSecure into ${table}`);
    }
  }
  
  // Update data securely with proper typing
  static async updateSecure<T extends TableNames>(
    table: T,
    id: string,
    data: Partial<Database['public']['Tables'][T]['Update']>,
  ): Promise<any> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data as any)
        .eq('id' as any, id)
        .select()
        .single();
      
      if (error) throw error;
      if (!result) throw new Error(`No record found or failed to update in ${table}`);
      
      return result;
    } catch (error: any) {
      return this.handleError(error, `updateSecure in ${table}`);
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
      
      if (error) throw error;
      return true;
    } catch (error: any) {
      return this.handleError(error, `deleteSecure from ${table}`);
    }
  }
}
