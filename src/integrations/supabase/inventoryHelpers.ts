
import { supabase } from './client';

// Helper function to check if an item exists in inventory (case insensitive)
export const findInventoryItem = async (name: string, code: string = '') => {
  try {
    // Get the current user first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("Authentication required to access inventory");
      throw new Error("Authentication required");
    }
    
    // Prepare search conditions
    const searchQueries = [];
    
    if (name) {
      searchQueries.push(`name.ilike.%${name}%`);
    }
    
    if (code) {
      searchQueries.push(`item_code.ilike.%${code}%`);
    }
    
    if (searchQueries.length === 0) {
      return [];
    }
    
    const searchCondition = searchQueries.join(',');
    
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
    // Get the current user first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("Authentication required to access inventory");
      throw new Error("Authentication required");
    }
    
    if (!name) {
      return [];
    }
    
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
    // Get the current user first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("Authentication required to update inventory");
      throw new Error("Authentication required");
    }
    
    if (!id) {
      throw new Error("Item ID is required to update stock");
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id as any)
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
    // Get the current user first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("Authentication required to check item references");
      throw new Error("Authentication required");
    }
    
    if (!itemId) {
      throw new Error("Item ID is required to check references");
    }
    
    const { data, error } = await supabase
      .from('dispensing')
      .select('id')
      .eq('medication_id', itemId as any);
    
    if (error) throw error;
    
    return data.length > 0;
  } catch (error) {
    console.error("Error checking item references:", error);
    return false;
  }
};
