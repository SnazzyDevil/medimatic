
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
    if (!data) {
        throw new Error("Cannot convert null or undefined data to PracticeInformation");
    }
    
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
    if (!data) {
        throw new Error("Cannot convert null or undefined data from PracticeInformation");
    }
    
    const result: Record<string, any> = {};
    
    // Only include properties that are defined
    if (data.name !== undefined) result.name = data.name;
    if (data.practiceType !== undefined) result.practice_type = data.practiceType;
    if (data.registrationNumber !== undefined) result.registration_number = data.registrationNumber;
    if (data.vatNumber !== undefined) result.vat_number = data.vatNumber;
    if (data.doctorName !== undefined) result.doctor_name = data.doctorName;
    if (data.email !== undefined) result.email = data.email;
    if (data.phone !== undefined) result.phone = data.phone;
    if (data.website !== undefined) result.website = data.website;
    if (data.addressLine1 !== undefined) result.address_line1 = data.addressLine1;
    if (data.addressLine2 !== undefined) result.address_line2 = data.addressLine2;
    if (data.city !== undefined) result.city = data.city;
    if (data.stateProvince !== undefined) result.state_province = data.stateProvince;
    if (data.postalCode !== undefined) result.postal_code = data.postalCode;
    if (data.country !== undefined) result.country = data.country;
    if (data.logoUrl !== undefined) result.logo_url = data.logoUrl;
    if (data.practiceImageUrl !== undefined) result.practice_image_url = data.practiceImageUrl;
    if (data.businessHours !== undefined) result.business_hours = data.businessHours;
    if (data.currency !== undefined) result.currency = data.currency;
    if (data.taxPercentage !== undefined) result.tax_percentage = data.taxPercentage;
    if (data.appointmentReminderEnabled !== undefined) result.appointment_reminder_enabled = data.appointmentReminderEnabled;
    if (data.smsNotificationsEnabled !== undefined) result.sms_notifications_enabled = data.smsNotificationsEnabled;
    if (data.emailNotificationsEnabled !== undefined) result.email_notifications_enabled = data.emailNotificationsEnabled;
    if (data.twoFactorAuthRequired !== undefined) result.two_factor_auth_required = data.twoFactorAuthRequired;
    if (data.isActive !== undefined) result.is_active = data.isActive;
    if (data.settings !== undefined) result.settings = data.settings;
    if (data.metadata !== undefined) result.metadata = data.metadata;
    
    return result;
}
