
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Type guard to check if an object is a PostgrestError
 */
export function isPostgrestError(obj: any): obj is PostgrestError {
  return obj && typeof obj === 'object' && 'code' in obj && 'message' in obj && 'details' in obj;
}

/**
 * Type guard to check if a query result is a SelectQueryError
 */
export function isSelectQueryError(obj: any): boolean {
  return obj && typeof obj === 'object' && 'error' in obj && obj.error === true;
}

/**
 * Safe access helper for Supabase query results
 * Safely access properties on potentially null or error objects
 */
export function safelyAccess<T, K extends keyof T>(
  obj: T | null | undefined | { error: true },
  key: K,
  defaultValue: T[K]
): T[K] {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return (obj as T)[key] ?? defaultValue;
}

/**
 * Type guard to check if data returned from Supabase is valid and not an error
 */
export function isValidData<T>(data: T | null | undefined | { error: true }): data is T {
  return data !== null && data !== undefined && !isSelectQueryError(data);
}

/**
 * Safely maps Supabase query results to a desired type with data transformations
 */
export function mapQueryResultSafely<T, R>(
  data: T[] | null | undefined | { error: true },
  mapper: (item: T, index: number) => R,
  includeNullValues: boolean = false
): R[] {
  if (!data || isSelectQueryError(data)) {
    return [];
  }

  return Array.isArray(data) 
    ? data
        .filter(item => includeNullValues || item !== null)
        .map((item, index) => mapper(item as T, index)) 
    : [];
}

/**
 * Helper to safely cast types when working with Supabase
 * Only use this when you are confident about the structure
 */
export function safeCast<T>(data: any): T {
  return data as T;
}
