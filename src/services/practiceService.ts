import { supabase, logSupabaseOperation } from '@/integrations/supabase/client';
import {
    PracticeInformation,
    CreatePracticeInformation,
    UpdatePracticeInformation,
    convertToPracticeInformation,
    convertFromPracticeInformation
} from '@/types/practice';
import { AccessDeniedError } from '@/services/secureDataService';

export class PracticeService {
    /**
     * Get practice information by ID
     */
    static async getById(id: string): Promise<PracticeInformation | null> {
        try {
            if (!id) {
                throw new Error('Practice ID is required');
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new AccessDeniedError("Authentication required");
            }
            
            const { data, error } = await supabase
                .from('practice_information')
                .select('*')
                .eq('id', id)
                .eq('created_by', user.id) // Ensure only accessing own data
                .maybeSingle();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.error('Access denied for practice information:', id);
                    throw new AccessDeniedError();
                }
                console.error('Error fetching practice information:', error);
                throw error;
            }

            return data ? convertToPracticeInformation(data) : null;
        } catch (error) {
            if (error instanceof AccessDeniedError) {
                throw error;
            }
            console.error('Error in getById:', error);
            throw error;
        }
    }

    /**
     * Get practice information for the current user
     */
    static async getCurrentPractice(): Promise<PracticeInformation | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                console.warn('No authenticated user found when trying to get current practice');
                return null;
            }

            const { data, error } = await supabase
                .from('practice_information')
                .select('*')
                .eq('created_by', user.id)
                .maybeSingle();

            if (error) {
                console.error('Error fetching current practice information:', error);
                throw error;
            }
            
            if (process.env.NODE_ENV !== 'production') {
                logSupabaseOperation('getCurrentPractice', !error, data, error);
            }
            
            return data ? convertToPracticeInformation(data) : null;
        } catch (error) {
            console.error('Error in getCurrentPractice:', error);
            throw error;
        }
    }

    /**
     * Create new practice information
     */
    static async create(practice: CreatePracticeInformation): Promise<PracticeInformation> {
        try {
            if (!practice) {
                throw new Error('Practice information is required');
            }
            
            // Validate required fields
            if (!practice.name) throw new Error('Practice name is required');
            if (!practice.registrationNumber) throw new Error('Registration number is required');
            if (!practice.email) throw new Error('Email is required');
            if (!practice.phone) throw new Error('Phone is required');
            if (!practice.addressLine1) throw new Error('Address is required');
            if (!practice.city) throw new Error('City is required');
            if (!practice.postalCode) throw new Error('Postal code is required');
            
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new AccessDeniedError("Authentication required to create practice");
            }

            const dbData = convertFromPracticeInformation(practice);
            
            const { data, error } = await supabase
                .from('practice_information')
                .insert([{ ...dbData, created_by: user.id }])
                .select()
                .single();

            if (error) {
                console.error('Error creating practice information:', error);
                throw error;
            }
            
            if (process.env.NODE_ENV !== 'production') {
                logSupabaseOperation('create practice', !error, data, error);
            }
            
            return convertToPracticeInformation(data);
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }

    /**
     * Update practice information
     */
    static async update(id: string, practice: UpdatePracticeInformation): Promise<PracticeInformation> {
        try {
            if (!id) {
                throw new Error('Practice ID is required');
            }
            
            if (!practice || Object.keys(practice).length === 0) {
                throw new Error('Update data is required');
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new AccessDeniedError("Authentication required to update practice");
            }
            
            // Filter out undefined values to prevent overwriting with null
            const dbData = convertFromPracticeInformation(practice);
            
            // First verify the user owns this practice
            const { data: existingPractice, error: fetchError } = await supabase
                .from('practice_information')
                .select('id')
                .eq('id', id)
                .eq('created_by', user.id)
                .maybeSingle();
                
            if (fetchError) {
                console.error('Error verifying practice ownership:', fetchError);
                throw fetchError;
            }
            
            if (!existingPractice) {
                console.error('Access denied: User does not own this practice');
                throw new AccessDeniedError();
            }
            
            const { data, error } = await supabase
                .from('practice_information')
                .update(dbData)
                .eq('id', id)
                .eq('created_by', user.id) // Extra security layer
                .select()
                .single();

            if (error) {
                console.error('Error updating practice information:', error);
                console.error('Update payload:', dbData);
                throw error;
            }

            if (!data) {
                throw new Error(`No data returned when updating practice with ID ${id}`);
            }
            
            if (process.env.NODE_ENV !== 'production') {
                logSupabaseOperation('update practice', !error, data, error);
            }
            
            return convertToPracticeInformation(data);
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    }

    /**
     * Update practice logo
     */
    static async updateLogo(id: string, file: File): Promise<string> {
        try {
            if (!id) {
                throw new Error('Practice ID is required');
            }
            
            if (!file) {
                throw new Error('File is required');
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new AccessDeniedError("Authentication required to update logo");
            }
            
            // First verify the user owns this practice
            const { data: existingPractice, error: fetchError } = await supabase
                .from('practice_information')
                .select('id')
                .eq('id', id)
                .eq('created_by', user.id)
                .maybeSingle();
                
            if (fetchError) {
                console.error('Error verifying practice ownership:', fetchError);
                throw fetchError;
            }
            
            if (!existingPractice) {
                console.error('Access denied: User does not own this practice');
                throw new AccessDeniedError();
            }
            
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${id}-${Date.now()}.${fileExt}`;
            const filePath = `practice-assets/${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('practice-assets')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading logo:', uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('practice-assets')
                .getPublicUrl(filePath);

            await this.update(id, { logoUrl: publicUrl });
            
            if (process.env.NODE_ENV !== 'production') {
                logSupabaseOperation('updateLogo', true, { publicUrl });
            }
            
            return publicUrl;
        } catch (error) {
            console.error('Error in updateLogo:', error);
            throw error;
        }
    }

    /**
     * Update practice image
     */
    static async updatePracticeImage(id: string, file: File): Promise<string> {
        try {
            if (!id) {
                throw new Error('Practice ID is required');
            }
            
            if (!file) {
                throw new Error('File is required');
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new AccessDeniedError("Authentication required to update practice image");
            }
            
            // First verify the user owns this practice
            const { data: existingPractice, error: fetchError } = await supabase
                .from('practice_information')
                .select('id')
                .eq('id', id)
                .eq('created_by', user.id)
                .maybeSingle();
                
            if (fetchError) {
                console.error('Error verifying practice ownership:', fetchError);
                throw fetchError;
            }
            
            if (!existingPractice) {
                console.error('Access denied: User does not own this practice');
                throw new AccessDeniedError();
            }
            
            const fileExt = file.name.split('.').pop();
            const fileName = `practice-${id}-${Date.now()}.${fileExt}`;
            const filePath = `practice-assets/${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('practice-assets')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading practice image:', uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('practice-assets')
                .getPublicUrl(filePath);

            await this.update(id, { practiceImageUrl: publicUrl });
            
            if (process.env.NODE_ENV !== 'production') {
                logSupabaseOperation('updatePracticeImage', true, { publicUrl });
            }
            
            return publicUrl;
        } catch (error) {
            console.error('Error in updatePracticeImage:', error);
            throw error;
        }
    }

    /**
     * Delete practice information
     */
    static async delete(id: string): Promise<void> {
        try {
            if (!id) {
                throw new Error('Practice ID is required');
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new AccessDeniedError("Authentication required to delete practice");
            }
            
            // First verify the user owns this practice
            const { data: existingPractice, error: fetchError } = await supabase
                .from('practice_information')
                .select('id')
                .eq('id', id)
                .eq('created_by', user.id)
                .maybeSingle();
                
            if (fetchError) {
                console.error('Error verifying practice ownership:', fetchError);
                throw fetchError;
            }
            
            if (!existingPractice) {
                console.error('Access denied: User does not own this practice');
                throw new AccessDeniedError("You do not have permission to delete this practice");
            }
            
            const { error } = await supabase
                .from('practice_information')
                .delete()
                .eq('id', id)
                .eq('created_by', user.id); // Double check user owns this practice

            if (error) {
                console.error('Error deleting practice information:', error);
                throw error;
            }
            
            if (process.env.NODE_ENV !== 'production') {
                logSupabaseOperation('delete practice', !error, { id }, error);
            }
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }
}
