
import { supabase } from '@/integrations/supabase/client';
import {
    PracticeInformation,
    CreatePracticeInformation,
    UpdatePracticeInformation,
    convertToPracticeInformation,
    convertFromPracticeInformation
} from '@/types/practice';

export class PracticeService {
    // Using 'practice_information' directly as a literal type instead of a string variable
    // This should resolve the TypeScript error as it matches the expected table name type

    /**
     * Get practice information by ID
     */
    static async getById(id: string): Promise<PracticeInformation | null> {
        const { data, error } = await supabase
            .from('practice_information')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching practice information:', error);
            throw error;
        }

        return data ? convertToPracticeInformation(data) : null;
    }

    /**
     * Get practice information for the current user
     */
    static async getCurrentPractice(): Promise<PracticeInformation | null> {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.warn('No authenticated user found when trying to get current practice');
            // For development purposes, try to get the first practice
            const { data, error } = await supabase
                .from('practice_information')
                .select('*')
                .limit(1)
                .maybeSingle();
                
            if (error || !data) {
                console.error('Error fetching any practice information:', error);
                return null;
            }
            
            return convertToPracticeInformation(data);
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

        return data ? convertToPracticeInformation(data) : null;
    }

    /**
     * Create new practice information
     */
    static async create(practice: CreatePracticeInformation): Promise<PracticeInformation> {
        const { data: { user } } = await supabase.auth.getUser();
        
        let userId = null;
        if (user) {
            userId = user.id;
        } else {
            console.warn('No authenticated user when creating practice. Using null for created_by.');
        }

        const dbData = convertFromPracticeInformation(practice);
        console.log("Converted practice data for DB:", dbData);
        
        const { data, error } = await supabase
            .from('practice_information')
            .insert([{ ...dbData, created_by: userId }])
            .select()
            .maybeSingle();

        if (error) {
            console.error('Error creating practice information:', error);
            throw error;
        }

        return convertToPracticeInformation(data);
    }

    /**
     * Update practice information
     */
    static async update(id: string, practice: UpdatePracticeInformation): Promise<PracticeInformation> {
        // Filter out undefined values to prevent overwriting with null
        const updateData = Object.entries(practice).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);
        
        const dbData = convertFromPracticeInformation(updateData as UpdatePracticeInformation);
        console.log("Updating practice with ID:", id);
        console.log("Update data for DB:", dbData);
        
        const { data, error } = await supabase
            .from('practice_information')
            .update(dbData)
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) {
            console.error('Error updating practice information:', error);
            console.error('Update payload:', dbData);
            throw error;
        }

        if (!data) {
            throw new Error(`No data returned when updating practice with ID ${id}`);
        }

        return convertToPracticeInformation(data);
    }

    /**
     * Update practice logo
     */
    static async updateLogo(id: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const filePath = `practice-assets/${fileName}`;

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

        return publicUrl;
    }

    /**
     * Update practice image
     */
    static async updatePracticeImage(id: string, file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `practice-${Date.now()}.${fileExt}`;
        const filePath = `practice-assets/${fileName}`;

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

        return publicUrl;
    }

    /**
     * Delete practice information
     */
    static async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('practice_information')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting practice information:', error);
            throw error;
        }
    }
}
