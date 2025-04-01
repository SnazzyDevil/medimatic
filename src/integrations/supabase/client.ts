
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sggeszinrtkzpivgawzm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZ2VzemlucnRrenBpdmdhd3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNDQ5MzMsImV4cCI6MjA1NjkyMDkzM30.Z4ykozhfU1D0JulqTlTWc0_ix910sUGStn6eN6mkPgY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper function to perform case-insensitive search in Supabase
export const ilike = (column: string, value: string) => {
  return `${column}.ilike.%${value}%`;
};

// Helper function to check if an item exists in inventory (case insensitive)
export const findInventoryItem = async (name: string, code: string = '') => {
  try {
    // Prepare search conditions
    let searchCondition = '';
    
    if (name && code) {
      // Search by both name and code
      searchCondition = `name.ilike.%${name}%,item_code.ilike.%${code}%`;
    } else if (name) {
      // Search by name only
      searchCondition = `name.ilike.%${name}%`;
    } else if (code) {
      // Search by code only
      searchCondition = `item_code.ilike.%${code}%`;
    } else {
      // No search criteria provided
      return [];
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .or(searchCondition);
      
    if (error) {
      console.error("Error finding inventory item:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in findInventoryItem:", error);
    throw error;
  }
};

// Helper function for exact match checking (case insensitive)
export const findExactInventoryItemByName = async (name: string) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .ilike('name', name);
      
    if (error) {
      console.error("Error finding inventory item by exact name:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in findExactInventoryItemByName:", error);
    throw error;
  }
};

// Helper function to update existing inventory item stock
export const updateInventoryItemStock = async (id: string, newStock: number) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error("Error updating inventory item stock:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in updateInventoryItemStock:", error);
    throw error;
  }
};

// Helper function to check if an item exists in dispensing records
export const checkItemReferences = async (itemId: string) => {
  try {
    const { data, error } = await supabase
      .from('dispensing')
      .select('id')
      .eq('medication_id', itemId);
    
    if (error) throw error;
    
    return data.length > 0;
  } catch (error) {
    console.error("Error checking item references:", error);
    return false;
  }
};
