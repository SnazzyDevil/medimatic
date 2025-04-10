
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Type guard to check if an object is a PostgrestError
 */
export function isPostgrestError(obj: any): obj is PostgrestError {
  return obj && typeof obj === 'object' && 'code' in obj && 'message' in obj && 'details' in obj;
}

/**
 * Interface for errors in select queries
 */
export interface SelectQueryError {
  error: true;
  message?: string;
}

/**
 * Type guard to check if a query result is a SelectQueryError
 */
export function isSelectQueryError(obj: any): obj is SelectQueryError {
  return obj && typeof obj === 'object' && 'error' in obj && obj.error === true;
}

/**
 * Safe access helper for Supabase query results
 * Safely access properties on potentially null or error objects
 */
export function safelyAccess<T extends Record<string, any>, K extends keyof T>(
  obj: T | null | undefined | SelectQueryError,
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
export function isValidData<T>(data: T | null | undefined | SelectQueryError): data is T {
  return data !== null && data !== undefined && !isSelectQueryError(data);
}

/**
 * Safely maps Supabase query results to a desired type with data transformations
 */
export function mapQueryResultSafely<T, R>(
  data: T[] | null | undefined | SelectQueryError,
  mapper: (item: T, index: number) => R,
  includeNullValues: boolean = false
): R[] {
  if (!data || isSelectQueryError(data) || !Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item): item is NonNullable<T> => includeNullValues || item !== null)
    .map(mapper);
}

/**
 * Helper to safely cast types when working with Supabase
 * Only use this when you are confident about the structure
 */
export function safeCast<T>(data: any): T | null {
  if (!data || isSelectQueryError(data)) return null;
  return data as T;
}

/**
 * Type-safe function to check if a Supabase query returned data
 */
export function hasData<T>(result: { data: T | null, error: any }): result is { data: T, error: null } {
  return result.data !== null && !result.error;
}

/**
 * Helper to safely extract a single item from a Supabase query
 */
export function getSingleResult<T>(result: { data: T[] | null, error: any }): T | null {
  if (result.error || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
    return null;
  }
  return result.data[0];
}

/**
 * Helper function to safely transform query data with proper type checking
 */
export function transformQueryData<T, R>(
  data: T[] | null | undefined,
  transformer: (item: T) => R
): R[] {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => transformer(item));
}

/**
 * Ensures that the given data is always returned as an array
 */
export function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (data === null || data === undefined) return [];
  return Array.isArray(data) ? data : [data];
}

/**
 * Formats PostgreSQL errors into readable messages
 */
export function formatPostgresError(error: PostgrestError | Error | unknown): string {
  if (isPostgrestError(error)) {
    // Handle known Postgres error codes
    switch (error.code) {
      case '23505':
        return 'A record with this information already exists.';
      case '23503':
        return 'This operation would violate referential integrity (foreign key constraint).';
      case '23502':
        return 'Required field is missing.';
      case '42P01':
        return 'The database table does not exist.';
      case '42703':
        return 'Column referenced does not exist.';
      default:
        return error.message || 'An unknown database error occurred.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred.';
}
