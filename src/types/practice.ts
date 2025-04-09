
export type PracticeType = 'medical' | 'dental' | 'pharmacy' | 'clinic' | 'hospital' | 'other';

export interface BusinessHours {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
}

export interface PracticeInformation {
    id: string;
    // Basic Information
    name: string;
    practiceType: PracticeType;
    registrationNumber: string;
    vatNumber?: string;
    doctorName?: string;
    
    // Contact Information
    email: string;
    phone: string;
    website?: string;
    
    // Address Information
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince?: string;
    postalCode: string;
    country: string;
    
    // Media
    logoUrl?: string;
    practiceImageUrl?: string;
    
    // Business Information
    businessHours?: BusinessHours;
    currency: string;
    taxPercentage: number;
    
    // Settings and Preferences
    appointmentReminderEnabled: boolean;
    smsNotificationsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    twoFactorAuthRequired: boolean;
    
    // System Fields
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    isActive: boolean;
    
    // Metadata/Additional Settings
    settings?: Record<string, any>;
    metadata?: Record<string, any>;
}

// Helper type for creating new practice information
export type CreatePracticeInformation = Omit<PracticeInformation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

// Helper type for updating practice information
export type UpdatePracticeInformation = Partial<CreatePracticeInformation>;

// Convert database snake_case to camelCase
export function convertToPracticeInformation(data: any): PracticeInformation {
    return {
        id: data.id,
        name: data.name,
        practiceType: data.practice_type,
        registrationNumber: data.registration_number,
        vatNumber: data.vat_number,
        doctorName: data.doctor_name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        addressLine1: data.address_line1,
        addressLine2: data.address_line2,
        city: data.city,
        stateProvince: data.state_province,
        postalCode: data.postal_code,
        country: data.country,
        logoUrl: data.logo_url,
        practiceImageUrl: data.practice_image_url,
        businessHours: data.business_hours,
        currency: data.currency,
        taxPercentage: data.tax_percentage,
        appointmentReminderEnabled: data.appointment_reminder_enabled,
        smsNotificationsEnabled: data.sms_notifications_enabled,
        emailNotificationsEnabled: data.email_notifications_enabled,
        twoFactorAuthRequired: data.two_factor_auth_required,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by,
        isActive: data.is_active,
        settings: data.settings,
        metadata: data.metadata
    };
}

// Convert camelCase to database snake_case
export function convertFromPracticeInformation(data: CreatePracticeInformation | UpdatePracticeInformation): any {
    return {
        name: data.name,
        practice_type: data.practiceType,
        registration_number: data.registrationNumber,
        vat_number: data.vatNumber,
        doctor_name: data.doctorName,
        email: data.email,
        phone: data.phone,
        website: data.website,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        state_province: data.stateProvince,
        postal_code: data.postalCode,
        country: data.country,
        logo_url: data.logoUrl,
        practice_image_url: data.practiceImageUrl,
        business_hours: data.businessHours,
        currency: data.currency,
        tax_percentage: data.taxPercentage,
        appointment_reminder_enabled: data.appointmentReminderEnabled,
        sms_notifications_enabled: data.smsNotificationsEnabled,
        email_notifications_enabled: data.emailNotificationsEnabled,
        two_factor_auth_required: data.twoFactorAuthRequired,
        is_active: data.isActive,
        settings: data.settings,
        metadata: data.metadata
    };
}
