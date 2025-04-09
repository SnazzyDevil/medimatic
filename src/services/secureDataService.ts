
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TableNames = keyof Database['public']['Tables'];

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
  static async fetchSecure<T = any>(
    table: TableNames, 
    query: any = {}, 
    options: { single?: boolean } = {}
  ): Promise<T | T[] | null> {
    try {
      // Start with the base query
      let queryBuilder = supabase.from(table).select(query.select || "*");
      
      // Apply filters if provided
      if (query.filter) {
        Object.entries(query.filter).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value as any);
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
      
      return data as T | T[];
    } catch (error: any) {
      return this.handleError(error, `fetchSecure from ${table}`);
    }
  }
  
  // Insert data securely
  static async insertSecure<T = any>(
    table: TableNames,
    data: any,
  ): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result as T;
    } catch (error: any) {
      return this.handleError(error, `insertSecure into ${table}`);
    }
  }
  
  // Update data securely
  static async updateSecure<T = any>(
    table: TableNames,
    id: string,
    data: any,
  ): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result as T;
    } catch (error: any) {
      return this.handleError(error, `updateSecure in ${table}`);
    }
  }
  
  // Delete data securely
  static async deleteSecure(
    table: TableNames,
    id: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      return this.handleError(error, `deleteSecure from ${table}`);
    }
  }
}
