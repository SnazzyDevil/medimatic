
import { supabase } from '@/integrations/supabase/client';
import {
    PracticeInformation,
    CreatePracticeInformation,
    UpdatePracticeInformation,
    convertToPracticeInformation,
    convertFromPracticeInformation
} from '@/types/practice';

export class PracticeService {
    private static TABLE_NAME = 'practice_information';

    /**
     * Get practice information by ID
     */
    static async getById(id: string): Promise<PracticeInformation | null> {
        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

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
            throw new Error('No authenticated user');
        }

        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('created_by', user.id)
            .single();

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
        
        if (!user) {
            throw new Error('No authenticated user');
        }

        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .insert([{ ...convertFromPracticeInformation(practice), created_by: user.id }])
            .select()
            .single();

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
        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .update(convertFromPracticeInformation(practice))
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating practice information:', error);
            throw error;
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
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting practice information:', error);
            throw error;
        }
    }
}
